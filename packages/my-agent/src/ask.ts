import { type Message, Role, type Task } from "@a2a-js/sdk";
import {
  type Client,
  ClientFactory,
  ClientFactoryOptions,
  DefaultAgentCardResolver,
  JsonRpcTransportFactory,
} from "@a2a-js/sdk/client";
import {
  type AvailabilityRequest,
  type BarberReply,
  type BookingConfirmed,
  type BookingRejected,
  confirmationMatches,
  dataPart,
  firstData,
  offerMatches,
  parseAvailabilityRequest,
  parseBarberReply,
  parseBookingReply,
} from "@hitchpost/core";
import { Approval } from "./gate.ts";

/** Errors whose message is ours and safe to show a person. Anything else may carry remote text. */
export class AskError extends Error {}

/** Connect to an agent: no redirects anywhere, and only if every call address stays on the origin we asked. */
async function connect(agentUrl: string, signal: AbortSignal): Promise<Client> {
  const fetchImpl: typeof fetch = (url, init) => fetch(url, { ...init, redirect: "error", signal });
  const card = await new DefaultAgentCardResolver({ fetchImpl }).resolve(agentUrl);
  const origin = new URL(agentUrl).origin;
  if (card.supportedInterfaces.some((i) => new URL(i.url).origin !== origin)) {
    throw new AskError("That agent's card sends calls to a different address, so I didn't use it.");
  }
  const factory = new ClientFactory(
    ClientFactoryOptions.createFrom(ClientFactoryOptions.default, {
      transports: [new JsonRpcTransportFactory({ fetchImpl })],
    }),
  );
  return factory.createFromAgentCard(card);
}

function send(client: Client, value: unknown, signal: AbortSignal): Promise<Message | Task> {
  return client.sendMessage(
    {
      tenant: "",
      message: {
        role: Role.ROLE_USER,
        messageId: crypto.randomUUID(),
        contextId: "",
        taskId: "",
        parts: [dataPart(value)],
        extensions: [],
        metadata: {},
        referenceTaskIds: [],
      },
      configuration: undefined,
      metadata: undefined,
    },
    { signal },
  );
}

/** Look up a barber agent by URL and ask it for a slot. Returns its validated reply. */
export async function askForSlot(
  barberUrl: string,
  input: AvailabilityRequest,
  { timeoutMs = 10_000 } = {},
): Promise<BarberReply> {
  const request = parseAvailabilityRequest(input);
  if (!request) throw new AskError("That request isn't valid: check the service and the dates.");

  // One deadline for the whole exchange, card discovery included.
  const signal = AbortSignal.timeout(timeoutMs);
  const result = await send(await connect(barberUrl, signal), request, signal);

  // A question gets a Message back. A Task means the barber agent failed or misbehaved.
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

/**
 * Book the offer a person approved. Only a genuine Approval from the gate can get here, and the
 * confirmation must restate that offer exactly before anyone treats it as booked.
 */
export async function bookOffer(
  barberUrl: string,
  approval: Approval,
  { timeoutMs = 10_000, now = Date.now() } = {},
): Promise<BookingConfirmed | BookingRejected> {
  if (!Approval.isGenuine(approval)) throw new AskError("Nothing was booked: there's no approval.");
  if (now >= approval.deadline) throw new AskError("That offer's hold has run out. Ask again.");

  const signal = AbortSignal.timeout(timeoutMs);
  const { offer } = approval;
  const result = await send(
    await connect(barberUrl, signal),
    { kind: "booking_request", offerId: offer.offerId },
    signal,
  );

  // A commitment comes back as a Task; its final status message carries the answer.
  if ("parts" in result)
    throw new AskError("Barber agent answered a booking with a plain message.");
  const reply = parseBookingReply(firstData(result.status?.message));
  if (!reply) throw new AskError("Barber agent sent a booking reply I don't understand.");
  if (reply.kind === "booking_confirmed" && !confirmationMatches(offer, reply)) {
    throw new AskError(
      "The confirmation doesn't match the offer you approved. Treat it as not booked.",
    );
  }
  return reply;
}
