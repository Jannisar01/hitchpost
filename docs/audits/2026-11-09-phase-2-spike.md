# Evidence: Phase 2 protocol spike

- **Date:** 2026-11-09
- **Branch:** `phase-2-protocol-spike`
- **SDK:** `@a2a-js/sdk` 1.3.0
- **Why:** three independent grades in a row said the next step up needed evidence, not more documents. The SA&D package was frozen (`sad-v1.5-frozen`) and this spike was built to prove or disprove the booking protocol in code.

## 1. What the SDK actually does (run, not read)

`packages/e2e/src/sdk-behaviour.test.ts`, 7 tests, all passing. This file is also the regression suite for SDK upgrades.

| #   | Fact                                                                                              | Design consequence                                                                               |
| --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| F1  | A completed Task's final message is stored; `GetTask` returns it                                  | The booking token lands in task history. The "never in history" rule is impossible; see ADR 0021 |
| F2  | `ListTasks` under `noAuthentication` returns every caller's tasks, secrets included               | O-1 is real and live, not theoretical                                                            |
| F3  | A send naming a completed task's id is refused ("terminal state")                                 | Retries with a taskId must use `GetTask`                                                         |
| F4  | A resend without a taskId creates a new task                                                      | The SDK doesn't de-duplicate: Hitchpost must (offerId to taskId)                                 |
| F5  | A required extension is refused without the `A2A-Extensions` header; `serviceParameters` sends it | The round 2 design is right; the client knows how                                                |
| F6  | A `DefaultRequestHandler` subclass can refuse `ListTasks` while sending works                     | Fix for O-1 proven                                                                               |
| F7  | A task left WORKING can be finished later by writing to the task store                            | Fix for O-2 proven: a resolver needs no running executor                                         |

## 2. What was built

| Piece                                                                                                                                 | Where                                   | Proven by                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| Offers carry `issuedAt` and `expiresAt` (P-01, business clock authoritative)                                                          | `packages/core/src/booking.ts`          | core tests                                                                             |
| `booking_request`, `booking_confirmed`, `booking_rejected` with strict parsers; a confirmation must restate the offer field for field | `packages/core/src/booking.ts`          | 3 core tests                                                                           |
| Offer store: open holds block the slot for everyone until expiry                                                                      | `packages/barber-agent/src/executor.ts` | "an open hold blocks the slot..."                                                      |
| Per-business cap on open holds, whoever asks (P-31)                                                                                   | same                                    | "one business never holds more than MAX_OPEN_HOLDS..."                                 |
| Booking as an A2A Task, check-and-write in one synchronous step                                                                       | same                                    | "approve then book...", "a booking_request sent as a raw A2A message gets a Task back" |
| Rejections: `expired`, `unknown_offer`, `slot_taken`                                                                                  | same                                    | three e2e tests                                                                        |
| De-duplication: a resend gets the original confirmation with `duplicateOf`; token derived by HMAC so it is identical                  | same                                    | "a resend books once..."                                                               |
| Method policy: `ListTasks` and `CancelTask` refused                                                                                   | `packages/barber-agent/src/server.ts`   | "ListTasks and CancelTask are refused..."                                              |
| Approval gate: an `Approval` only comes from the gate, is bound to one offer and refused past the person's own deadline (P-09)        | `packages/my-agent/src/gate.ts`         | "no approval, no booking...", "the gate won't approve..."                              |
| `bookOffer` sends only with a genuine Approval and checks the confirmation                                                            | `packages/my-agent/src/ask.ts`          | e2e suite                                                                              |
| CLI asks "Book it? (y/N)" after showing the exact offer                                                                               | `packages/my-agent/src/main.ts`         | live run below                                                                         |

**Tests:** 44 passing (23 before the spike, 7 SDK facts, 3 core, 11 booking end to end).

**Do the tests have teeth?** Three deliberate mutations, each caught by exactly the test meant to catch it: removing de-duplication, letting holds not count as taken, and replacing the method policy with the plain SDK handler.

**Live run:**

```text
Offer: haircut at 2026-11-12T17:30:00.000Z for 30.00 USD
Held until ...  Nothing is booked until you approve it.
Book it? (y/N) y
Booked: haircut at 2026-11-12T17:30:00.000Z. Booking f8c83dde-...
(asking again for the same window) No haircut slots in that window.
```

## 3. What changed in the design

- **ADR 0021:** refuse `ListTasks`; `taskId` and `bookingToken` are bearer secrets; the token is derived by HMAC. Supersedes "never place a bookingToken in task history".
- **O-1 closed** in code (method policy, tested). **O-2 closed** in principle (F7); the resolver itself is only needed for restart recovery and the Later manual-approval mode.

## 4. Not done in this spike (still Phase 2)

- Persistence: bookings and offers are in memory, so a restart loses them (FR-BOOK-13, NFR-REL-02). The SQLite store and the Task rebuild at startup are the next step.
- Cancel and reschedule (`cancel_request` with the token, `reschedule_request`, cutoff P-10).
- The client doesn't send the `A2A-Extensions` header yet, and the card doesn't require the extension yet (F5 shows how).
- Customer contact block, offer disclosure block (legal name, tax, cancellation terms, phone), install-key caps, de-duplication of `availability_request`, enumerated `rejected` reasons (`hold_cap` is free text today).
- Audit logs on both sides.

## 5. Estimate calibration

The plan (16) gives Phase 2 its effort in hours. This spike covered the protocol core of about four work packages in one working session. Re-estimate Phase 2 from the remaining list above rather than from the original work breakdown, as 16 commits to.
