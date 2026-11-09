# 0011. An in-memory appointment book until a real booking tool is wired in

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

ADR 0003 says each agent reaches its own tools over MCP. Which booking system barbers actually use is still an open question in the [product brief](../insights.md). Wiring a specific vendor now would be a guess.

## Decision

The barber agent reads a plain `Book` object (services, opening hours, booked slots) through one function, `findFreeSlot`. Times are UTC, slots are 30 minutes.

## Alternatives considered

- **Integrate a real booking vendor now:** commits to a vendor before talking to a single barber.
- **Put the book behind a local MCP server already:** correct end state, but extra moving parts before there is anything to swap.

## Consequences

`findFreeSlot` is the only place that touches the book, so replacing it with an MCP call to the real system is a contained change. Time zones are deferred: a real shop's local hours need handling before any real booking.

## Correction (2026-11-08)

Slot lookup goes through `findFreeSlot`, but the executor also reads the book's currency, and Phase 2 adds a write path. `booked` changed from start times to time ranges after the audit found overlapping bookings.
