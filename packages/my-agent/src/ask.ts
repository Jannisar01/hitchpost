import { Role } from "@a2a-js/sdk";
import {
  ClientFactory,
  ClientFactoryOptions,
  DefaultAgentCardResolver,
  JsonRpcTransportFactory,
} from "@a2a-js/sdk/client";
import {
  type AvailabilityRequest,
  type BarberReply,
  dataPart,
  firstData,
  offerMatches,
  parseAvailabilityRequest,
  parseBarberReply,
} from "@hitchpost/core";

/** Errors whose message is ours and safe to show a person. Anything else may carry remote text. */
export class AskError extends Error {}

/** Look up a barber agent by URL and ask it for a slot. Returns its validated reply. */
export async function askForSlot(
  barberUrl: string,
  input: AvailabilityRequest,
  { timeoutMs = 10_000 } = {},
): Promise<BarberReply> {
  const request = parseAvailabilityRequest(input);
  if (!request) throw new AskError("That request isn't valid: check the service and the dates.");

  // One deadline for the whole exchange, card discovery included. No redirects anywhere.
  const signal = AbortSignal.timeout(timeoutMs);
  const fetchImpl: typeof fetch = (url, init) => fetch(url, { ...init, redirect: "error", signal });

  // The card says where to send calls. Only trust it if every address stays on the origin we asked.
  const card = await new DefaultAgentCardResolver({ fetchImpl }).resolve(barberUrl);
  const origin = new URL(barberUrl).origin;
  if (card.supportedInterfaces.some((i) => new URL(i.url).origin !== origin)) {
    throw new AskError("That agent's card sends calls to a different address, so I didn't use it.");
  }
  const factory = new ClientFactory(
    ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
      transports: [new JsonRpcTransportFactory({ fetchImpl })],
    }),
  );
  const client = await factory.createFromAgentCard(card);
  const result = await client.sendMessage(
    {
      tenant: "",
      message: {
        role: Role.ROLE_USER,
        messageId: crypto.randomUUID(),
        contextId: "",
        taskId: "",
        parts: [dataPart(request)],
        extensions: [],
        metadata: {},
        referenceTaskIds: [],
      },
      configuration: undefined,
      metadata: undefined,
    },
    { signal },
  );

  // A Task instead of a Message means the barber agent failed or wants a longer exchange.
  if (!("parts" in result)) {
    throw new AskError(
      `Barber agent answered with a task (state ${result.status?.state}), not an offer.`,
    );
  }
  // The barber agent is someone else's code: its reply is untrusted until validated.
  const reply = parseBarberReply(firstData(result));
  if (!reply) throw new AskError("Barber agent sent a reply I don't understand.");
  if (reply.kind === "offer" && !offerMatches(request, reply)) {
    throw new AskError("Barber agent's offer doesn't match what I asked for.");
  }
  return reply;
}
