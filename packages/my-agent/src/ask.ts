import { Role } from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";
import {
  type AvailabilityRequest,
  type BarberReply,
  dataPart,
  firstData,
  parseBarberReply,
} from "@hitchpost/core";

/** Look up a barber agent by URL and ask it for a slot. Returns its validated reply. */
export async function askForSlot(
  barberUrl: string,
  request: AvailabilityRequest,
): Promise<BarberReply> {
  const client = await new ClientFactory().createFromUrl(barberUrl);
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
    { signal: AbortSignal.timeout(10_000) },
  );

  // The barber agent is someone else's code: its reply is untrusted until validated.
  const reply = "parts" in result ? parseBarberReply(firstData(result)) : undefined;
  if (!reply) throw new Error("Barber agent sent a reply I don't understand");
  return reply;
}
