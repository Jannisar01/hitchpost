# 0008. First vertical: barber appointments

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

"Agents for every business" is too wide to build or test. The first version needs one transaction done well.

## Decision

Start with barber appointment booking: check availability, offer, book, reschedule, cancel.

## Why barbers

- The transaction is small and well defined.
- It happens often, so value shows fast.
- Barbers already use booking tools, giving the business agent a real system behind it.
- A mistake costs a rebooking, not a health or legal problem.

## Alternatives considered

- **Restaurants:** similar shape, but dominated by existing reservation platforms.
- **Clinics:** high value, but privacy regulation makes it a poor place to learn.
- **Horizontal from the start:** no clear "done", hard to test.

## Consequences

Data models start appointment-shaped. They will be generalized once a second vertical is added, not before.
