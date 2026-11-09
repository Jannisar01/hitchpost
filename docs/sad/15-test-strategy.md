# HP-SAD-15 · Test strategy and plan

| Field       | Value                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-15                                                                                                                              |
| Version     | 1.2                                                                                                                                    |
| Status      | Baselined for Phase 2                                                                                                                  |
| Date        | 2026-11-09                                                                                                                             |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                                       |
| Conforms to | ISO/IEC/IEEE 29119-3:2021 (test documentation: test strategy and test plan information items); ISO/IEC/IEEE 29119-2 risk-based testing |

How every requirement gets proven, at which level, against which risk, and what has to pass before anything ships.

## 1. Purpose and scope

This is the project test plan for Hitchpost from Phase 1 to v1 (end of Phase 6), in the structure of ISO/IEC/IEEE 29119-3. It covers the test items, the features in and out of scope, the risks that drive test priority, the approach per level, a catalogue of test cases with stable IDs (`TC-nn`), entry, exit, suspension and resumption criteria, environments and deliverables. Requirements trace to these test cases in the [traceability matrix in 05](05-requirements.md#7-traceability-matrix); every FR and NFR there names its verification method and test cases.

References: [05 Requirements](05-requirements.md), [11 Quality attributes](11-quality-attributes.md), [12 Security and privacy](12-security-and-privacy.md), [18 Deployment and operations](18-deployment-and-operations.md), [01 v1 release criteria](01-vision-and-scope.md#8-v1-release-criteria-end-of-phase-6), parameter register in [00](00-document-control.md#10-normative-parameters-and-phase-map).

## 2. Test policy: test first

**Test first for every bug and every trust-boundary rule.** Write the failing test, watch it fail, then fix.

The [Phase 1 audit](../audits/2026-11-08-phase-1.md) is why. Lint, types and 11 tests were all green while five real bugs got through, because the tests only checked the happy path. The fixes all landed test-first, and the auditors' attacks were re-run against the fixed code. The audit also caught one wrong _test_ (a 60-minute service expected past closing time), so tests get reviewed like code.

## 3. Test items

| Item                                                                       | Version under test           | Phase                          |
| -------------------------------------------------------------------------- | ---------------------------- | ------------------------------ |
| `packages/core` (message types, validators, `offerMatches`)                | `main` at the release commit | 1 (Built)                      |
| `packages/barber-agent` (A2A server, executor, appointment book)           | same                         | 1 (Built)                      |
| `packages/my-agent` (A2A client `askForSlot`, CLI)                         | same                         | 1 (Built)                      |
| `packages/e2e` (cross-agent and contract suites)                           | same                         | 2                              |
| `packages/directory` (listings API, verification, admin)                   | same                         | 3                              |
| `packages/app` (client app with built-in personal agent, barber dashboard) | same                         | 4                              |
| `packages/ratings` (outcomes, metrics, reviews)                            | same                         | 5                              |
| Hosted deployment (staging, production) and CI workflows                   | tagged release               | 6 (staging exists from WP-6.1) |

## 4. Features to be tested and not tested

**Tested:** every FR and NFR in [05](05-requirements.md), each through the method and test cases its traceability row names.

**Not tested, with the reason:**

| Feature                                                    | Why not                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| The A2A SDK's own transports beyond JSON-RPC (REST, gRPC)  | Not advertised in our agent cards until tested; NFR-INT-01 covers what we advertise.                    |
| The A2A SDK internals                                      | Third-party, covered by its own suite; we test our use of it end to end.                                |
| Payments, deposits, natural-language front end, federation | Out of scope for v1 ([01](01-vision-and-scope.md#4-non-goals)).                                         |
| Shop-side cancellation over the protocol                   | Later; in v1 the shop contacts the customer out of band ([05](05-requirements.md#1-purpose-and-scope)). |
| Load beyond one neighbourhood                              | v1 targets one area; capacity tests size to the pilot ([18](18-deployment-and-operations.md)).          |

## 5. Risk basis

Test priority follows product risk (R- in [03](03-business-case.md)) and security threats (T- in [12](12-security-and-privacy.md)). High-risk areas get tests at more than one level.

| Risk or threat         | What could go wrong                                             | Test response                                                                                  | Priority            |
| ---------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------- |
| R-04, T-01, T-02, T-11 | Hostile or malformed input crashes an agent or reaches a person | Validator tables, injection corpus, hostile-agent fixtures (TC-13, TC-15, TC-20, TC-49, TC-50) | High                |
| T-03, R-07             | A wrong offer is shown for approval                             | Offer matching unit and end-to-end (TC-16, TC-21)                                              | High                |
| T-04, T-10             | A booking without approval, or approval of A books B            | Gate, binding and capability-token tests including a type-level fixture (TC-42, TC-43, TC-48)  | High                |
| R-07, NFR-REL-02       | Double booking or a lost booking                                | Concurrency race, idempotent retry, restart survival (TC-35, TC-36, TC-46)                     | High                |
| T-05, T-06, R-06       | One sender exhausts CPU or chairs                               | Window cap, hold caps, rate limits (TC-13, TC-38, TC-47, TC-93)                                | Medium              |
| T-08                   | Error responses leak internals                                  | Error-path probe (TC-30)                                                                       | Medium              |
| T-12, T-13             | Client hangs or is steered to another host                      | Deadline and origin tests (TC-22, TC-62)                                                       | Medium              |
| R-05, T-07, T-15       | Fake business agents                                            | Verification from Phase 3 (TC-60); signed cards from Phase 6 (TC-92)                           | High from Phase 3   |
| T-16                   | Fake reviews                                                    | Rating eligibility (TC-80)                                                                     | Medium from Phase 5 |
| R-08                   | Personal data exposure or kept too long                         | Inspection of message kinds; export and delete (TC-97)                                         | High from Phase 6   |
| R-10                   | A2A changes break interop                                       | Third-party agent and contract fixtures per version (TC-31, TC-64)                             | Medium              |

## 6. Approach by level

| Level                    | What it proves                                                                                                                           | Tool                                                                             | Entry criteria                                       | Exit criteria                                                                 | Status                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Unit                     | Pure logic: slot finding, validators, offer matching, gate types                                                                         | `node:test`                                                                      | Code compiles; `pnpm typecheck` clean                | All unit TCs pass; no surviving mutants in validators at release (section 13) | **Built**                                                  |
| Contract                 | Every `hitchpost/1` message kind is accepted or rejected exactly as [13](13-interfaces.md) specifies; supported old versions still parse | `node:test` table tests over JSON fixtures                                       | Message kind specified in 13 with field limits in 09 | Every kind has accept and reject fixtures; all pass                           | Built (validator tables), Phase 2 (fixtures, TC-31, TC-49) |
| End to end over A2A      | Real server on a free port, real client, card discovery, JSON-RPC, Tasks                                                                 | `node:test` + `startBarberAgent`; moves to `packages/e2e` in Phase 2             | Unit and contract levels green                       | All end-to-end TCs for the phase pass three runs in a row (no flakes)         | **Built**                                                  |
| Security and adversarial | Hostile agents, injection strings, oversized and malformed input, silent servers, error-path leaks                                       | `node:test` hostile fixtures (`SneakyExecutor`, silent server); injection corpus | Threat for the feature listed in 12                  | Every threat marked "Phase N" in 12 for this phase has a passing TC           | Built (first cases), Phase 2 (corpus, TC-30, TC-50)        |
| Performance              | Latency against NFR-PERF-01; one request can't block the server                                                                          | k6 against staging                                                               | Staging deployed with production-like data           | p95 under 2 s at the pilot load profile in 18                                 | Phase 6                                                    |
| Accessibility            | Client app meets NFR-A11Y-01                                                                                                             | axe-core in CI plus a manual screen-reader pass                                  | Screen built to the 14 wireframe                     | Zero serious or critical axe findings; manual pass recorded                   | Phase 4                                                    |
| User acceptance          | Real barbers and customers complete bookings                                                                                             | Pilot in one area, scripted tasks plus observation ([17](17-transition-plan.md)) | Release exit criteria for the pilot build met        | Pilot go/no-go in 17 passes                                                   | Phase 6                                                    |

## 7. Test case catalogue

Built test cases map one to one to a `test(...)` call; the name is exact so it can be searched. Planned test cases name their phase and the package they will live in.

### 7.1 Built (22, all passing)

| TC    | File                                     | Test name                                                         | Verifies                                                             |
| ----- | ---------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| TC-01 | `packages/barber-agent/src/book.test.ts` | skips taken slots                                                 | FR-BOOK-04                                                           |
| TC-02 | same                                     | a longer service never runs into the next booking                 | FR-BOOK-04                                                           |
| TC-03 | same                                     | a booking off the 30 minute grid still blocks the slots it covers | FR-BOOK-04                                                           |
| TC-04 | same                                     | rounds a mid-slot start up to the next slot                       | FR-BOOK-04                                                           |
| TC-05 | same                                     | a window that starts before opening gets the opening slot         | FR-BOOK-04                                                           |
| TC-06 | same                                     | a service may end exactly at closing, never after                 | FR-BOOK-04                                                           |
| TC-07 | same                                     | latest is inclusive                                               | FR-BOOK-04                                                           |
| TC-08 | same                                     | never offers a slot in the past                                   | FR-BOOK-04                                                           |
| TC-09 | same                                     | closed days and unknown services have no slots                    | FR-BOOK-04                                                           |
| TC-10 | `packages/core/src/booking.test.ts`      | accepts a well formed availability request                        | FR-MSG-03                                                            |
| TC-11 | same                                     | normalizes instants with an offset to UTC                         | FR-MSG-06                                                            |
| TC-12 | same                                     | drops fields it does not know                                     | FR-MSG-03, NFR-PRIV-01                                               |
| TC-13 | same                                     | rejects bad availability requests                                 | FR-MSG-03, FR-MSG-06, FR-MSG-07, NFR-SEC-01, NFR-SEC-05, NFR-PERF-02 |
| TC-14 | same                                     | parses each kind of barber reply and drops unknown fields         | FR-MSG-03, NFR-PRIV-01                                               |
| TC-15 | same                                     | rejects bad barber replies                                        | FR-MSG-03, NFR-SEC-01, NFR-SEC-05                                    |
| TC-16 | same                                     | an offer only matches the request it answers                      | FR-MSG-04                                                            |
| TC-17 | `packages/my-agent/src/ask.test.ts`      | my agent asks, the barber agent offers the first free slot        | FR-MSG-01, FR-MSG-02, NFR-INT-01                                     |
| TC-18 | same                                     | the barber agent says so when nothing is free                     | FR-MSG-01, FR-MSG-02                                                 |
| TC-19 | same                                     | my agent won't send a request it can't validate itself            | FR-MSG-01, FR-MSG-08                                                 |
| TC-20 | same                                     | the barber agent rejects a free text message                      | FR-MSG-01, FR-MSG-02, NFR-SEC-01                                     |
| TC-21 | same                                     | my agent refuses an offer that doesn't answer its request         | FR-MSG-01, FR-MSG-04                                                 |
| TC-22 | same                                     | my agent gives up on an agent that never answers                  | FR-MSG-01, FR-MSG-05                                                 |

### 7.2 Planned, Phase 2 (`packages/e2e` unless noted)

| TC    | Test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Verifies                          |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| TC-30 | Oversized body, malformed JSON and an unknown route return plain JSON errors with no stack trace, file path or `x-powered-by` (`packages/barber-agent`)                                                                                                                                                                                                                                                                                                                                            | NFR-SEC-04                        |
| TC-31 | The agent card declares the contract extension uri with `required: true`; a message with an unknown `kind` gets `rejected`                                                                                                                                                                                                                                                                                                                                                                         | FR-MSG-09                         |
| TC-32 | Availability returns a Message; booking, cancel and reschedule return Tasks                                                                                                                                                                                                                                                                                                                                                                                                                        | FR-MSG-10                         |
| TC-33 | An offer carries `issuedAt` and `expiresAt` (P-01); its slot isn't offered to another context before expiry, and is after                                                                                                                                                                                                                                                                                                                                                                          | FR-BOOK-01                        |
| TC-34 | `booking_request` with an unknown, expired or other-context `offerId` ends `booking_rejected` with the right reason; the book is unchanged                                                                                                                                                                                                                                                                                                                                                         | FR-BOOK-02                        |
| TC-35 | Two `booking_request`s for the same slot processed concurrently: exactly one `booking_confirmed`                                                                                                                                                                                                                                                                                                                                                                                                   | FR-BOOK-02, NFR-REL-02            |
| TC-36 | A client that has the `taskId` retries with `GetTask` and gets the same Task, pending or confirmed. A client that lost the response resends `booking_request` without a `taskId`: the new Task completes at once with the same `booking_confirmed` payload plus `duplicateOf` naming the original Task, and the book holds exactly one booking. Same for `cancel_request` (SDK 1.3: a send without `taskId` mints a new Task, `server/index.js:2801`; a send to a finished Task throws, line 2789) | FR-BOOK-07                        |
| TC-37 | `offer_declined` releases the hold at once                                                                                                                                                                                                                                                                                                                                                                                                                                                         | FR-BOOK-08                        |
| TC-38 | A fourth open hold from one sender is refused (P-07), whatever `contextId`s it uses                                                                                                                                                                                                                                                                                                                                                                                                                | FR-BOOK-09                        |
| TC-39 | Cancel with the right `bookingToken` frees the slot; inside a shop cutoff it ends REJECTED with `cancel_rejected` reason `cutoff`; an unknown booking gives `unknown_booking`                                                                                                                                                                                                                                                                                                                      | FR-BOOK-03, FR-BOOK-10            |
| TC-40 | Reschedule keeps the old booking until the new one is confirmed; a failed new booking leaves the old one standing; inside the shop's cutoff (P-10) the swap ends `booking_rejected` with reason `cutoff`                                                                                                                                                                                                                                                                                           | FR-BOOK-11                        |
| TC-41 | Manual approval with a fixed clock: Task stays WORKING with a status message; owner yes confirms; owner no gives `shop_declined`; P-03 elapsed gives `shop_timeout`; the reserved slot isn't re-offered meanwhile                                                                                                                                                                                                                                                                                  | FR-GATE-05                        |
| TC-42 | Booking is impossible without an `Approval`: a fixture that calls the booking path without one fails `tsc`, and no runtime path sends a `booking_request` without one (`packages/my-agent`)                                                                                                                                                                                                                                                                                                        | FR-GATE-01, FR-GATE-04            |
| TC-43 | An approval for offer A can't book offer B; an approval within P-09 of expiry is refused locally                                                                                                                                                                                                                                                                                                                                                                                                   | FR-GATE-02                        |
| TC-44 | Each flow leaves complete, ordered, append-only audit entries on both sides, each with `contextId`, `taskId`, `offerId`, `messageId` and a JCS payload hash                                                                                                                                                                                                                                                                                                                                        | FR-GATE-03, FR-MSG-11, NFR-OBS-01 |
| TC-45 | An invalid book configuration (bad hours, duplicate service, bad currency, unparseable booked range) stops the barber agent from starting (`packages/barber-agent`)                                                                                                                                                                                                                                                                                                                                | FR-BOOK-12                        |
| TC-46 | Restart the barber agent mid-flow: offers, bookings, audit and Tasks survive; a confirmed booking is never lost                                                                                                                                                                                                                                                                                                                                                                                    | NFR-REL-02                        |
| TC-47 | Requests above P-08 from one IP get HTTP 429                                                                                                                                                                                                                                                                                                                                                                                                                                                       | NFR-SEC-03                        |
| TC-48 | Capabilities, not `contextId`, authorise: a `booking_request` naming an unknown `offerId` is rejected; `cancel_request` and `reschedule_request` without the matching `bookingToken` are rejected; a client-chosen `contextId` grants nothing (SDK 1.3 keeps the client's `contextId`, `server/index.js:2815`)                                                                                                                                                                                     | FR-MSG-12                         |
| TC-49 | Contract fixtures: accept and reject cases for every `hitchpost/1` kind, against the limits in 09                                                                                                                                                                                                                                                                                                                                                                                                  | FR-MSG-03                         |
| TC-50 | Injection corpus through every text and time field of every kind is rejected or stored inert                                                                                                                                                                                                                                                                                                                                                                                                       | NFR-SEC-01                        |
| TC-51 | Our clients send the contract extension uri in the `A2A-Extensions` header and are served; a client that omits the header gets `ExtensionSupportRequiredError` (SDK 1.3 checks `context.requestedExtensions`, `server/index.js:2775`)                                                                                                                                                                                                                                                              | FR-MSG-09                         |
| TC-52 | `reschedule_request` is answered as a Message: an `offer` with `replacesBookingId`, `no_availability`, or `rejected` with reason `cutoff` inside P-10                                                                                                                                                                                                                                                                                                                                              | FR-BOOK-11                        |

### 7.3 Planned, Phases 3 to 6

| TC    | Phase | Test                                                                                                                                                        | Verifies    |
| ----- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| TC-60 | 3     | Registration publishes only after origin proof; unverified listings stay unpublished                                                                        | FR-DIR-01   |
| TC-61 | 3     | Search by name, service and area returns matching verified listings, nearest first                                                                          | FR-DIR-02   |
| TC-62 | 3     | A card whose interface URL has another origin is refused by the client and flagged by the directory                                                         | FR-DIR-03   |
| TC-63 | 3     | A business can update and remove its own listing and no other                                                                                               | FR-DIR-04   |
| TC-64 | 6     | An A2A agent built outside this repo completes a booking on staging (RC 6, WP-6.12)                                                                         | NFR-INT-01  |
| TC-70 | 4     | Contacts are agents, added from the directory or by URL                                                                                                     | FR-APP-01   |
| TC-71 | 4     | The approval sheet renders only validated fields as plain text and shows "Nothing is booked until you approve."                                             | FR-APP-02   |
| TC-72 | 4     | The built-in personal agent completes a booking with no external agent                                                                                      | FR-APP-03   |
| TC-73 | 4     | Bookings list shows upcoming bookings; reschedule and cancel work from it                                                                                   | FR-APP-04   |
| TC-74 | 4     | A blocked contact can't reach the person's agent                                                                                                            | FR-APP-05   |
| TC-75 | 4     | A matching `booking_confirmed` is written to the calendar; a mismatched one is not and is flagged                                                           | FR-APP-06   |
| TC-76 | 4     | axe-core audit of every screen: zero serious or critical findings                                                                                           | NFR-A11Y-01 |
| TC-77 | 4     | Manual screen-reader pass of the approve-and-book flow, recorded (demonstration)                                                                            | NFR-A11Y-01 |
| TC-80 | 5     | Only verified interactions can be rated, once per side                                                                                                      | FR-RATE-01  |
| TC-81 | 5     | Behaviour metrics computed from an audit-log fixture match hand-calculated values                                                                           | FR-RATE-02  |
| TC-82 | 5     | Human reviews are shown separately from metrics                                                                                                             | FR-RATE-03  |
| TC-83 | 4     | The shop marks a past booking Completed or NoShow in the dashboard; the north star counts Completed only                                                    | FR-RATE-04  |
| TC-84 | 5     | A listing shows its verification status and rating summary                                                                                                  | FR-DIR-05   |
| TC-85 | 5     | A report reaches the moderation queue                                                                                                                       | FR-ADMIN-01 |
| TC-86 | 5     | The customer's "Did it go as booked?" answer is recorded on the interaction record and never overrides the shop's mark silently (a disagreement is flagged) | FR-RATE-05  |
| TC-87 | 5     | The ratings service accepts an interaction record only when both sides' audit events carry matching JCS SHA-256 hashes of the offer and the decision        | FR-RATE-01  |
| TC-90 | 6     | Suspending a listing hides it and notifies the business with the reason                                                                                     | FR-ADMIN-01 |
| TC-91 | 6     | Every moderation action appears in the moderation audit trail                                                                                               | FR-ADMIN-02 |
| TC-92 | 6     | An unsigned card, or one signed by a revoked key, can't book; interaction records carry both sides' signatures (ADR 0017)                                   | NFR-SEC-02  |
| TC-93 | 6     | Per-identity rate limit returns 429 above P-08                                                                                                              | NFR-SEC-03  |
| TC-94 | 6     | Load test at the pilot profile: offer round trip p95 under 2 s                                                                                              | NFR-PERF-01 |
| TC-95 | 6     | Monthly availability report from monitoring shows at least 99.5% (analysis)                                                                                 | NFR-REL-01  |
| TC-96 | 6     | One trace id follows a booking across directory, both agents and the app                                                                                    | NFR-OBS-01  |
| TC-97 | 6     | Export and delete of a test person's data within P-13; backups expire per P-15                                                                              | NFR-PRIV-02 |
| TC-98 | 6     | Time-zone and daylight-saving cases: local grid, skipped local time has no slot, repeated local time offered once                                           | FR-BOOK-05  |
| TC-99 | 6     | Booking through the MCP connector is a conditional write; a conflicting write on the shop's system makes the booking fail cleanly                           | FR-BOOK-06  |

## 8. Coverage summary

Counts are by requirement; the detail is the traceability matrix in [05](05-requirements.md#7-traceability-matrix).

| Area  | Requirements | Built and tested now                                                                                                   | Planned test cases                                              |
| ----- | ------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| MSG   | 12           | FR-MSG-01 to FR-MSG-08 (TC-11 to TC-22)                                                                                | TC-31, TC-32, TC-44, TC-48, TC-49, TC-51                        |
| BOOK  | 12           | FR-BOOK-04 (TC-01 to TC-09)                                                                                            | TC-33 to TC-41, TC-45, TC-52, TC-98, TC-99                      |
| GATE  | 5            | None (Phase 2)                                                                                                         | TC-41 to TC-44                                                  |
| DIR   | 5            | None (Phase 3)                                                                                                         | TC-60 to TC-63, TC-84                                           |
| APP   | 6            | None (Phase 4)                                                                                                         | TC-70 to TC-75                                                  |
| RATE  | 5            | None (Phases 4 and 5)                                                                                                  | TC-80 to TC-83, TC-86, TC-87                                    |
| ADMIN | 2            | None                                                                                                                   | TC-85, TC-90, TC-91                                             |
| NFR   | 16           | NFR-SEC-01, NFR-SEC-05, NFR-PERF-02, NFR-INT-01 (ours) by test; NFR-SEC-04 by demonstration; NFR-PRIV-01 by inspection | TC-30, TC-46, TC-47, TC-50, TC-64, TC-76, TC-77, TC-92 to TC-97 |

## 9. Test data, environments and time

- **Fixed clocks.** Anything that depends on "now" takes it as a parameter (`findFreeSlot(..., now)`, `new BarberExecutor(book, now)`). Tests pin it to 2026-11-01 so they never rot as dates pass. Hold and approval timeouts (P-01, P-03) are tested by advancing the injected clock, never by sleeping.
- **Known calendar.** 2026-11-12 is a Thursday; the test book is open Thursdays 9 to 18 UTC.
- **Free ports.** Servers bind `127.0.0.1` on port 0, so tests run in parallel and in CI without clashes.
- **Hostile agents are test fixtures.** `SneakyExecutor` in `ask.test.ts` is a subclass of the real executor, so it stays a valid A2A agent with only the lie changed.
- **No real personal data** in any environment before Phase 6; pilot data follows [12](12-security-and-privacy.md) retention.

| Environment                                     | Used for                                                    | From                                   |
| ----------------------------------------------- | ----------------------------------------------------------- | -------------------------------------- |
| Local (Node 24, Windows and Linux)              | Unit, contract, end to end, security                        | Now                                    |
| CI (`ubuntu-latest`, Node from `.nvmrc`)        | Every level that runs in `node:test`; axe-core from Phase 4 | Now (workflow), enforced at first push |
| Staging ([18](18-deployment-and-operations.md)) | Smoke, interop, performance, release candidates             | Phase 6 (WP-6.1)                       |
| Production pilot                                | User acceptance only, per [17](17-transition-plan.md)       | Phase 6                                |

## 10. Suspension and resumption

| Suspend when                                                       | Resume when                                                     |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| CI is red on `main`                                                | The breaking change is reverted or fixed; CI green on `main`    |
| An end-to-end test fails intermittently                            | Root cause found and fixed; the test passes three runs in a row |
| A high or critical security finding is open on the item under test | The fix is merged with a test that failed before it             |
| Staging is down or diverges from the release commit                | Staging redeployed from the release tag and smoke test green    |
| A pilot SEV1 per [17](17-transition-plan.md)                       | Rollback done, root cause fixed, go/no-go re-run                |

## 11. Release exit criteria

A version is tagged only when every applicable row holds. v1 additionally needs every [v1 release criterion in 01](01-vision-and-scope.md#8-v1-release-criteria-end-of-phase-6); the last column says which one each row supports, and criterion 2 (real use) is measured in the pilot, not by tests.

| Exit criterion                                                                                                                            | From    | v1 criterion |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------ |
| CI green on the release commit                                                                                                            | Now     | 3            |
| Every requirement claimed for the release passes its verification method and test cases in [05](05-requirements.md#7-traceability-matrix) | Now     | 1            |
| No surviving mutants in the validators (section 13)                                                                                       | Phase 2 | 3            |
| Injection corpus and hostile-agent tests pass (TC-20, TC-21, TC-50)                                                                       | Phase 2 | 3            |
| No booking path reachable without an approval (TC-42, TC-43)                                                                              | Phase 2 | 1            |
| Concurrency, idempotency and restart tests pass (TC-35, TC-36, TC-46)                                                                     | Phase 2 | 1            |
| Contract fixtures for every supported version still parse (TC-31, TC-49); our clients send the extension header (TC-51)                   | Phase 2 | 6            |
| Staging smoke test: register, find, request, approve, book, cancel                                                                        | Phase 6 | 1, 4         |
| An agent built outside this repo completes a booking on staging (TC-64)                                                                   | Phase 6 | 6            |
| Accessibility checks pass (TC-76, TC-77)                                                                                                  | Phase 4 | 3            |
| Export and delete of a test person's data works (TC-97)                                                                                   | Phase 6 | 5            |
| Load test within NFR-PERF-01 (TC-94); `pnpm audit` clean                                                                                  | Phase 6 | 3, 4         |
| Signed cards and per-identity rate limits on (TC-92, TC-93)                                                                               | Phase 6 | 3            |
| Restore from backup tested and incident drill run ([18](18-deployment-and-operations.md))                                                 | Phase 6 | 4            |
| Bug log and journey updated; no open critical or high security issues                                                                     | Now     | 3            |

## 12. CI gates

Every PR and every push to `main` runs, in order (`.github/workflows/ci.yml`):

1. `pnpm install --frozen-lockfile`
2. `pnpm check` (Biome lint and format)
3. `pnpm typecheck` (tsc, including `erasableSyntaxOnly`)
4. `pnpm test`

All four must pass; the job `lint, typecheck, test` is the required check. The Claude review is advisory.

## 13. Mutation testing

The QA auditor mutated the code by hand and found 9 changes the old tests didn't notice. To keep that from happening again, I'll run Stryker (or a small mutation script) on `packages/core` and `findFreeSlot`, monthly and before each release. Target: no surviving mutants in the validators. Not in CI on every PR, because it's slow.

## 14. Deliverables

| Deliverable                   | Where                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| This test plan                | `docs/sad/15-test-strategy.md`                                                            |
| Test cases (code)             | `packages/*/src/*.test.ts`, `packages/e2e` from Phase 2                                   |
| Test results                  | CI run logs per commit; release notes link the run for the tag                            |
| Mutation reports              | Attached to the release notes                                                             |
| Defect records                | [Bug log](../bugs.md) and GitHub issues                                                   |
| Accessibility and UAT records | Phase 4 accessibility report; pilot report in [17](17-transition-plan.md)                 |
| Test completion report        | A section of each phase's journey entry: what ran, what passed, what was deferred and why |

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                | Author      |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0.1     | 2026-11-08 | First draft                                                                                                                                                                                                                                                                                                                                           | S. Jannisar |
| 1.0     | 2026-11-09 | Baselined: renumbered into lifecycle order, formal document control, standards conformance                                                                                                                                                                                                                                                            | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: restructured as a 29119-3 test plan (test items, features not tested, risk basis, entry and exit criteria per level, test case catalogue TC-01 to TC-99, suspension and resumption, environments, deliverables); corrected the coverage table                                                                   | S. Jannisar |
| 1.2     | 2026-11-09 | Second remediation after regrade: TC-36 rewritten for SDK duplicate handling; TC-38 per sender; TC-48 capability tokens; new TC-51 (extension header), TC-52 (reschedule as a Message with cutoff), TC-86 (customer outcome prompt, FR-RATE-05), TC-87 (hash attestation); TC-83 moved to Phase 4; staging, TC-64 and the smoke test moved to Phase 6 | S. Jannisar |
