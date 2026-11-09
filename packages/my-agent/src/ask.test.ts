import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { startBarberAgent } from "@hitchpost/barber-agent";
import { askForSlot } from "./ask.ts";

// End to end over real A2A: agent card discovery, JSON-RPC, data parts.
let barber: Awaited<ReturnType<typeof startBarberAgent>>;

before(async () => {
  barber = await startBarberAgent("Test Barbers", {
    currency: "USD",
    services: [{ name: "haircut", durationMinutes: 30, priceCents: 3000 }],
    hours: { 4: [9, 18] }, // Thursdays
    booked: ["2026-11-12T17:00:00.000Z"],
  });
});

after(() => barber.close());

test("my agent asks, the barber agent offers the first free slot", async () => {
  const reply = await askForSlot(barber.url, {
    kind: "availability_request",
    service: "haircut",
    earliest: "2026-11-12T17:00:00Z",
    latest: "2026-11-12T19:00:00Z",
  });
  assert.equal(reply.kind, "offer");
  assert.equal(reply.kind === "offer" && reply.start, "2026-11-12T17:30:00.000Z");
  assert.equal(reply.kind === "offer" && reply.priceCents, 3000);
});

test("the barber agent says so when nothing is free", async () => {
  const reply = await askForSlot(barber.url, {
    kind: "availability_request",
    service: "haircut",
    earliest: "2026-11-13T09:00:00Z", // Friday, closed
    latest: "2026-11-13T17:00:00Z",
  });
  assert.deepEqual(reply, { kind: "no_availability", service: "haircut" });
});
