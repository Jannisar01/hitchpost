import assert from "node:assert/strict";
import { test } from "node:test";
import { type Book, findFreeSlot } from "./book.ts";

// 2026-11-12 is a Thursday.
const book: Book = {
  currency: "USD",
  services: [{ name: "haircut", durationMinutes: 30, priceCents: 3000 }],
  hours: { 4: [9, 18] },
  booked: ["2026-11-12T17:00:00.000Z"],
};

test("skips taken slots", () => {
  const slot = findFreeSlot(book, "haircut", "2026-11-12T17:00:00Z", "2026-11-12T19:00:00Z");
  assert.equal(slot?.start, "2026-11-12T17:30:00.000Z");
});

test("rounds a mid-slot start up to the next slot", () => {
  const slot = findFreeSlot(book, "haircut", "2026-11-12T09:10:00Z", "2026-11-12T12:00:00Z");
  assert.equal(slot?.start, "2026-11-12T09:30:00.000Z");
});

test("never offers past closing time", () => {
  const late = { ...book, booked: [...book.booked, "2026-11-12T17:30:00.000Z"] };
  assert.equal(
    findFreeSlot(late, "haircut", "2026-11-12T17:00:00Z", "2026-11-12T23:00:00Z"),
    undefined,
  );
});

test("closed days and unknown services have no slots", () => {
  assert.equal(
    findFreeSlot(book, "haircut", "2026-11-13T09:00:00Z", "2026-11-13T17:00:00Z"),
    undefined,
  );
  assert.equal(
    findFreeSlot(book, "shave", "2026-11-12T09:00:00Z", "2026-11-12T17:00:00Z"),
    undefined,
  );
});
