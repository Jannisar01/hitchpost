// Phase 2 booking protocol, end to end over real A2A servers (ADR 0012, ADR 0021).
import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { Role, TaskState } from "@a2a-js/sdk";
import { ClientFactory } from "@a2a-js/sdk/client";
import {
  BarberExecutor,
  type Book,
  MAX_OPEN_HOLDS,
  OFFER_HOLD_MS,
  startBarberAgent,
} from "@hitchpost/barber-agent";
import { type AvailabilityRequest, dataPart, type Offer } from "@hitchpost/core";
import { Approval, AskError, askForSlot, bookOffer } from "@hitchpost/my-agent";

// A controllable clock for the business. 2026-11-12 is a Thursday.
let clock = Date.parse("2026-11-12T08:00:00Z");
const now = () => clock;

const freshBook = (): Book => ({
  currency: "USD",
  services: [{ name: "haircut", durationMinutes: 30, priceCents: 3000 }],
  hours: { 4: [9, 18] },
  booked: [{ start: "2026-11-12T17:00:00.000Z", durationMinutes: 30 }],
});

const evening: AvailabilityRequest = {
  kind: "availability_request",
  service: "haircut",
  earliest: "2026-11-12T17:00:00Z",
  latest: "2026-11-12T19:00:00Z",
};

let executor: BarberExecutor;
let barber: Awaited<ReturnType<typeof startBarberAgent>>;

before(async () => {
  executor = new BarberExecutor(freshBook(), now);
  barber = await startBarberAgent("Test Barbers", executor);
});
after(() => barber.close());
beforeEach(() => {
  clock = Date.parse("2026-11-12T08:00:00Z");
  executor.offers.clear();
  executor.book.booked.splice(0, Infinity, ...freshBook().booked);
});

async function offerFor(request = evening): Promise<Offer> {
  const reply = await askForSlot(barber.url, request);
  assert.equal(reply.kind, "offer");
  return reply as Offer;
}

const approve = (offer: Offer) => {
  const approval = Approval.grant(offer, Date.now());
  assert.ok(approval);
  return approval;
};

test("approve then book: the confirmation restates the offer and the chair is taken", async () => {
  const offer = await offerFor();
  assert.equal(offer.start, "2026-11-12T17:30:00.000Z");
  const reply = await bookOffer(barber.url, approve(offer));
  assert.equal(reply.kind, "booking_confirmed");
  assert.equal(reply.kind === "booking_confirmed" && reply.start, offer.start);
  assert.ok(executor.book.booked.some((b) => b.start === offer.start));
  // 17:00 and 17:30 are both taken now, and a 30 minute cut at 18:00 would end after closing.
  assert.deepEqual(await askForSlot(barber.url, evening), {
    kind: "no_availability",
    service: "haircut",
  });
});

test("an open hold blocks the slot for everyone else until it expires", async () => {
  const first = await offerFor();
  assert.deepEqual(await askForSlot(barber.url, evening), {
    kind: "no_availability",
    service: "haircut",
  });
  clock += OFFER_HOLD_MS;
  const second = await offerFor();
  assert.equal(second.start, first.start, "the expired hold released the slot");
});

test("an offer whose hold has run out on the business clock is rejected as expired", async () => {
  const offer = await offerFor();
  const approval = approve(offer);
  clock += OFFER_HOLD_MS;
  const reply = await bookOffer(barber.url, approval);
  assert.deepEqual(reply, { kind: "booking_rejected", offerId: offer.offerId, reason: "expired" });
  assert.equal(executor.book.booked.length, 1, "nothing was written");
});

test("a resend books once and answers with the original confirmation", async () => {
  const approval = approve(await offerFor());
  const first = await bookOffer(barber.url, approval);
  const again = await bookOffer(barber.url, approval);
  assert.ok(first.kind === "booking_confirmed" && again.kind === "booking_confirmed");
  assert.equal(again.bookingId, first.bookingId);
  assert.equal(again.bookingToken, first.bookingToken);
  assert.ok(again.duplicateOf, "marked as a duplicate of the first task");
  assert.equal(executor.book.booked.length, 2, "one walk-in plus exactly one booking");
});

test("a walk-in written to the book while the offer is held makes the booking fail as slot_taken", async () => {
  const offer = await offerFor();
  executor.book.booked.push({ start: offer.start, durationMinutes: 30 }); // the shop's own tool
  const reply = await bookOffer(barber.url, approve(offer));
  assert.deepEqual(reply, {
    kind: "booking_rejected",
    offerId: offer.offerId,
    reason: "slot_taken",
  });
});

test("an offer the business never made is rejected as unknown_offer", async () => {
  const real = await offerFor();
  const invented: Offer = { ...real, offerId: crypto.randomUUID() };
  const reply = await bookOffer(barber.url, approve(invented));
  assert.equal(reply.kind === "booking_rejected" && reply.reason, "unknown_offer");
});

test("no approval, no booking: a look-alike approval is refused before anything is sent", async () => {
  const offer = await offerFor();
  const fake = {
    offer,
    decidedAt: Date.now(),
    deadline: Date.now() + 60_000,
  } as unknown as Approval;
  await assert.rejects(bookOffer(barber.url, fake), AskError);
  assert.equal(executor.book.booked.length, 1, "nothing was written");
});

test("the gate won't approve an offer whose hold has run out on the person's own clock", async () => {
  const offer = await offerFor();
  const receivedLongAgo = Date.now() - OFFER_HOLD_MS;
  assert.equal(Approval.grant(offer, receivedLongAgo), undefined);
});

test("one business never holds more than MAX_OPEN_HOLDS slots, whoever is asking", async () => {
  const day: AvailabilityRequest = { ...evening, earliest: "2026-11-12T09:00:00Z" };
  for (let i = 0; i < MAX_OPEN_HOLDS; i++) await offerFor(day);
  assert.deepEqual(await askForSlot(barber.url, day), { kind: "rejected", reason: "hold_cap" });
});

test("ListTasks and CancelTask are refused, so nobody can list or cancel other people's bookings", async () => {
  const approval = approve(await offerFor());
  await bookOffer(barber.url, approval);
  const stranger = await new ClientFactory().createFromUrl(barber.url);
  await assert.rejects(
    stranger.listTasks({
      tenant: "",
      contextId: "",
      status: TaskState.TASK_STATE_UNSPECIFIED,
      pageToken: "",
      statusTimestampAfter: undefined,
    }),
    /not offered/,
  );
  await assert.rejects(
    stranger.cancelTask({ tenant: "", id: "any", metadata: undefined }),
    /cancel_request/,
  );
});

test("a booking_request sent as a raw A2A message gets a Task back, not a plain message", async () => {
  const offer = await offerFor();
  const client = await new ClientFactory().createFromUrl(barber.url);
  const result = await client.sendMessage({
    tenant: "",
    message: {
      role: Role.ROLE_USER,
      messageId: crypto.randomUUID(),
      contextId: "",
      taskId: "",
      parts: [dataPart({ kind: "booking_request", offerId: offer.offerId })],
      extensions: [],
      metadata: {},
      referenceTaskIds: [],
    },
    configuration: undefined,
    metadata: undefined,
  });
  assert.ok(!("parts" in result));
  assert.equal(result.status?.state, TaskState.TASK_STATE_COMPLETED);
});
