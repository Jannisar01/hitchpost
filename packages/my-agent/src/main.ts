// Ask a barber agent for a slot from the command line, then book it only if you say yes.
// Usage: pnpm --filter @hitchpost/my-agent start [barberUrl] [service] [earliestISO] [latestISO]
import { createInterface } from "node:readline/promises";
import { AskError, askForSlot, bookOffer } from "./ask.ts";
import { Approval } from "./gate.ts";

const [url = "http://127.0.0.1:41241", service = "haircut", earliest, latest] =
  process.argv.slice(2);

// Default: from the next full hour, over the next 3 days.
const from = earliest ?? new Date(Math.ceil(Date.now() / 3_600_000) * 3_600_000).toISOString();
const fromMs = Date.parse(from);
// An unreadable start leaves the end empty; askForSlot then rejects the request with a clear message.
const to = latest ?? (Number.isNaN(fromMs) ? "" : new Date(fromMs + 3 * 86_400_000).toISOString());

try {
  const reply = await askForSlot(url, {
    kind: "availability_request",
    service,
    earliest: from,
    latest: to,
  });
  // Every field below passed validation, so it holds no control characters.
  if (reply.kind === "offer") {
    const receivedAt = Date.now();
    const price = (reply.priceCents / 100).toFixed(2);
    console.log(`Offer: ${reply.service} at ${reply.start} for ${price} ${reply.currency}`);
    console.log(`Held until ${reply.expiresAt}. Nothing is booked until you approve it.`);

    // The person's yes, typed after seeing this exact offer, is the only way to an Approval.
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question("Book it? (y/N) ")).trim().toLowerCase();
    rl.close();
    if (answer !== "y") {
      console.log("Not booked.");
    } else {
      const approval = Approval.grant(reply, receivedAt);
      if (!approval)
        throw new AskError("That offer's hold ran out before you approved. Ask again.");
      const booked = await bookOffer(url, approval);
      console.log(
        booked.kind === "booking_confirmed"
          ? `Booked: ${booked.service} at ${booked.start}. Booking ${booked.bookingId}.`
          : `Not booked: the barber agent said ${booked.reason}.`,
      );
    }
  } else if (reply.kind === "no_availability") {
    console.log(`No ${reply.service} slots in that window.`);
  } else {
    console.log(`Barber agent rejected the request: ${reply.reason}`);
  }
} catch (err) {
  // Other errors can carry text from the remote server, so only our own messages are shown.
  console.error(err instanceof AskError ? err.message : "Couldn't get an answer from that agent.");
  process.exitCode = 1;
}
