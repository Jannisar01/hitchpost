import assert from "node:assert/strict";
import { test } from "node:test";
import { type Book, findFreeSlot } from "./book.ts";

// 2026-11-12 is a Thursday. "now" is fixed before it so tests don't depend on the clock.
const NOW = Date.parse("2026-11-01T00:00:00Z");

const book: Book = {
  currency: "USD",
  services: [
    { name: "haircut", durationMinutes: 30, priceCents: 3000 },
    { name: "colour", durationMinutes: 60, priceCents: 8000 },
  ],
  hours: { 4: [9, 18] },
  booked: [{ start: "2026-11-12T17:00:00.000Z", durationMinutes: 30 }],
};

const find = (b: Book, service: string, earliest: string, latest: string, now = NOW) =>
  findFreeSlot(b, service, earliest, latest, now)?.start;

test("skips taken slots", () => {
  assert.equal(
    find(book, "haircut", "2026-11-12T17:00:00Z", "2026-11-12T19:00:00Z"),
    "2026-11-12T17:30:00.000Z",
  );
});

test("a longer service never runs into the next booking", () => {
  // 16:30 + 60 min would overlap the 17:00 booking. Open until 20:00 so 17:30 fits.
  const longDay = { ...book, hours: { 4: [9, 20] as [number, number] } };
  assert.equal(
    find(longDay, "colour", "2026-11-12T16:30:00Z", "2026-11-12T19:00:00Z"),
    "2026-11-12T17:30:00.000Z",
  );
});

test("a booking off the 30 minute grid still blocks the slots it covers", () => {
  // 16:15 to 16:45 blocks both the 16:00 and the 16:30 slot.
  const offGrid = { ...book, booked: [{ start: "2026-11-12T16:15:00.000Z", durationMinutes: 30 }] };
  assert.equal(
    find(offGrid, "haircut", "2026-11-12T16:00:00Z", "2026-11-12T19:00:00Z"),
    "2026-11-12T17:00:00.000Z",
  );
});

test("rounds a mid-slot start up to the next slot", () => {
  assert.equal(
    find(book, "haircut", "2026-11-12T09:10:00Z", "2026-11-12T12:00:00Z"),
    "2026-11-12T09:30:00.000Z",
  );
});

test("a window that starts before opening gets the opening slot", () => {
  assert.equal(
    find(book, "haircut", "2026-11-12T06:00:00Z", "2026-11-12T12:00:00Z"),
    "2026-11-12T09:00:00.000Z",
  );
});

test("a service may end exactly at closing, never after", () => {
  assert.equal(
    find(book, "haircut", "2026-11-12T17:30:00Z", "2026-11-12T23:00:00Z"),
    "2026-11-12T17:30:00.000Z",
  );
  const late = { ...book, booked: [{ start: "2026-11-12T17:00:00.000Z", durationMinutes: 60 }] };
  assert.equal(find(late, "haircut", "2026-11-12T17:00:00Z", "2026-11-12T23:00:00Z"), undefined);
});

test("latest is inclusive", () => {
  assert.equal(
    find(book, "haircut", "2026-11-12T10:00:00Z", "2026-11-12T10:00:00Z"),
    "2026-11-12T10:00:00.000Z",
  );
});

test("never offers a slot in the past", () => {
  const now = Date.parse("2026-11-12T12:10:00Z");
  assert.equal(
    find(book, "haircut", "2026-11-12T09:00:00Z", "2026-11-12T18:00:00Z", now),
    "2026-11-12T12:30:00.000Z",
  );
  assert.equal(find(book, "haircut", "2020-01-02T09:00:00Z", "2020-01-03T00:00:00Z"), undefined);
});

test("closed days and unknown services have no slots", () => {
  assert.equal(find(book, "haircut", "2026-11-13T09:00:00Z", "2026-11-13T17:00:00Z"), undefined);
  assert.equal(find(book, "shave", "2026-11-12T09:00:00Z", "2026-11-12T17:00:00Z"), undefined);
});
