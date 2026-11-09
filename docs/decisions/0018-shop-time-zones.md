# 0018. Shop time zones: IANA zone per business, UTC on the wire

- **Date:** 2026-11-09
- **Status:** Accepted

## Context

Today every time is UTC and opening hours are whole UTC hours (`Book.hours` in `packages/barber-agent/src/book.ts`), with the 30-minute slot grid aligned to the UTC epoch. That's fine for a demo but wrong for any real shop. A barber opens at 9:30 local time, not "15:30 UTC in winter and 14:30 in summer". Zones with :30 or :45 offsets also put the slot grid in the wrong place. The design documents disagreed on when this gets fixed, naming Phases 2, 3 and 6 in different places.

## Decision

- **Phase 6, everywhere.** Before Phase 6 every booking is a UTC demo booking, and no real customer books before Phase 6. The docs say this in one place and reference this record.
- **On the wire:** instants stay strict ISO 8601, rebuilt as UTC (unchanged from Phase 1).
- **Per business:** an IANA zone name (for example `America/Chicago`) on the business and its listing.
- **Opening hours** become minutes of the local day (`openMinute`, `closeMinute`), so 9:30 is expressible.
- **Slot grid** starts from each day's local opening time and steps by the slot length, never from the UTC epoch.
- **Daylight saving:** a local time that doesn't exist (spring forward) produces no slot. A local time that happens twice (fall back) is offered once, at its first occurrence.
- **Display:** people see times in their own zone with the zone named. Shops see their own local time.
- **Tests:** fixed-clock tests for a spring-forward day, a fall-back day and a :45-offset zone, plus a check that the grid aligns to local opening.

## Alternatives considered

- **Phase 2:** correct earlier, but adds work before any real shop is involved, and the A-02 interviews may change how hours are entered.
- **Store hours in UTC:** they shift by an hour twice a year in most zones, which is wrong.
- **Fixed offsets instead of IANA zones:** they break at every DST change.

## Consequences

`findFreeSlot` and `Book` change shape in Phase 6, which is a breaking change to the shop's configuration but not to the message contract. Until then, the in-memory book's whole-hour UTC hours are a known limit, recorded in the tech-debt register.
