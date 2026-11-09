# 10. Test strategy

How every requirement gets proven, at which level, and what has to pass before anything ships.

## The rule

**Test first for every bug and every trust-boundary rule.** Write the failing test, watch it fail, then fix.

The [Phase 1 audit](../audits/2026-11-08-phase-1.md) is why. Lint, types and 11 tests were all green while five real bugs got through, because the tests only checked the happy path. The fixes all landed test-first, and the auditors' attacks were re-run against the fixed code. The audit also caught one wrong _test_ (a 60-minute service expected past closing time), so tests get reviewed like code.

## Levels

| Level                    | What it proves                                                                                                                                                                                                                                                       | Tool                                                                 | Status                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Unit                     | Pure logic: slot finding, validators, offer matching                                                                                                                                                                                                                 | `node:test`                                                          | **Built**                                    |
| Contract                 | Every `hitchpost/1` message kind (including Phase 2's `booking_request`, `booking_confirmed`, `booking_rejected`, `cancel_request`, `cancelled`, `reschedule_request`) is accepted or rejected exactly as [09](09-interfaces.md) specifies; old versions still parse | `node:test` table tests over JSON fixtures                           | Phase 2 (fixtures), Built (validator tables) |
| End to end over A2A      | Real server on a free port, real client, card discovery, JSON-RPC                                                                                                                                                                                                    | `node:test` + `startBarberAgent`; moves to `packages/e2e` in Phase 2 | **Built**                                    |
| Security and adversarial | Hostile agents, injection strings, oversized and malformed input, silent servers                                                                                                                                                                                     | `node:test` (Sneaky barber, silent server); injection corpus         | Built (first cases), Phase 2 (corpus)        |
| Performance              | Latency and throughput against NFR-PERF-01; one request can't block the server                                                                                                                                                                                       | autocannon or k6 against staging                                     | Phase 6                                      |
| Accessibility            | Client app meets NFR-A11Y-01                                                                                                                                                                                                                                         | axe-core in CI plus a manual screen-reader pass                      | Phase 4                                      |
| User acceptance          | Real barbers and customers complete bookings                                                                                                                                                                                                                         | Pilot in one area, scripted tasks plus observation                   | Phase 6                                      |

## What exists today

22 tests, all passing (`pnpm test`):

| File                                     | Tests | Covers                                                                                                                                                              |
| ---------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/barber-agent/src/book.test.ts` | 9     | Taken slots, long services not overlapping, off-grid bookings, rounding, opening time, closing time, inclusive end, no past slots, closed days and unknown services |
| `packages/core/src/booking.test.ts`      | 7     | Good requests, offset normalisation, unknown fields dropped, 16 kinds of bad request, each reply kind, 11 kinds of bad reply, offer matching                        |
| `packages/my-agent/src/ask.test.ts`      | 6     | Offer end to end, no availability, own request validated, raw free-text message rejected over A2A, sneaky barber refused, silent agent times out                    |

## Requirement coverage

| Requirement                                      | Test now                                                                    | Planned                                                                                                                             |
| ------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| FR-MSG-01 (agent card)                           | `ask.test.ts` (discovery in every e2e test)                                 | Card fields contract test                                                                                                           |
| FR-MSG-02 (typed request and offer)              | `ask.test.ts` offer and no-availability                                     | Contract fixtures per version                                                                                                       |
| FR-MSG-03 (validate inbound)                     | `booking.test.ts` bad request and bad reply tables; `ask.test.ts` free text | Injection corpus                                                                                                                    |
| FR-MSG-04 (offer matches request)                | `booking.test.ts` matching; `ask.test.ts` sneaky barber                     |                                                                                                                                     |
| FR-GATE-01..03 (approval, binding, audit)        | None yet                                                                    | Phase 2: booking impossible without an approval value; approval for offer A can't book B; every decision appears in both audit logs |
| FR-BOOK-01..03 (book, change, no double booking) | `book.test.ts` overlap and off-grid                                         | Phase 2: two clients race for one slot, exactly one wins                                                                            |
| FR-DIR-01..03                                    | None                                                                        | Phase 3: register, search, ownership check, origin check                                                                            |
| FR-APP-01..02                                    | None                                                                        | Phase 4: component and e2e tests of contacts and approval screen                                                                    |
| FR-RATE-01..02                                   | None                                                                        | Phase 5: only verified interactions can be rated; reports reach the queue                                                           |
| FR-ADMIN-01                                      | None                                                                        | Phase 6                                                                                                                             |
| NFR-SEC-01 (untrusted input)                     | Validator tables, sneaky barber, error handler (verified by audit probe)    | Error-handler e2e test; fuzzing of validators                                                                                       |
| NFR-SEC-03 (abuse bounds)                        | Window cap in `booking.test.ts`                                             | Rate-limit tests, Phase 6                                                                                                           |
| NFR-REL-01                                       | Silent-agent timeout                                                        | Staging load and failover tests                                                                                                     |
| NFR-PERF-01                                      | None                                                                        | Phase 6 load test                                                                                                                   |
| NFR-A11Y-01                                      | None                                                                        | Phase 4                                                                                                                             |
| NFR-INT-01 (A2A conformance)                     | e2e tests use the official SDK on both sides                                | Run against the A2A project's sample agents, Phase 3                                                                                |

## Test data and time

- **Fixed clocks.** Anything that depends on "now" takes it as a parameter (`findFreeSlot(..., now)`, `new BarberExecutor(book, now)`). Tests pin it to 2026-11-01 so they never rot as dates pass.
- **Known calendar.** 2026-11-12 is a Thursday; the test book is open Thursdays 9 to 18 UTC.
- **Free ports.** Servers bind `127.0.0.1` on port 0, so tests run in parallel and in CI without clashes.
- **Hostile agents are test fixtures.** `SneakyExecutor` in `ask.test.ts` is a subclass of the real executor, so it stays a valid A2A agent with only the lie changed.

## CI gates

Every PR and every push to `main` runs, in order (`.github/workflows/ci.yml`):

1. `pnpm install --frozen-lockfile`
2. `pnpm check` (Biome lint and format)
3. `pnpm typecheck` (tsc, including `erasableSyntaxOnly`)
4. `pnpm test`

All four must pass; the job `lint, typecheck, test` is the required check. The Claude review is advisory.

## Mutation testing

The QA auditor mutated the code by hand and found 9 changes the old tests didn't notice. To keep that from happening again, I'll run Stryker (or a small mutation script) on `packages/core` and `findFreeSlot`, monthly and before each release. Target: no surviving mutants in the validators. Not in CI on every PR, because it's slow.

## Release acceptance checklist

Before a version is tagged (see [11](11-deployment-and-operations.md)). v1 itself also needs the six [v1 release criteria](01-vision-and-scope.md#v1-release-criteria-end-of-phase-6); the last column says which one each check supports.

| Check                                                                           | From    | v1 criterion |
| ------------------------------------------------------------------------------- | ------- | ------------ |
| CI green on the release commit                                                  | Now     | 3            |
| Every requirement claimed for the release has a passing test in the table above | Now     | 1            |
| Injection corpus and hostile-agent tests pass                                   | Phase 2 | 3            |
| No booking path reachable without an approval (gate tests)                      | Phase 2 | 1            |
| Message contract fixtures for every supported version still parse               | Phase 2 | 6            |
| Staging smoke test: register, find, request, approve, book, cancel              | Phase 3 | 1, 4         |
| An agent built outside this repo completes a booking on staging                 | Phase 3 | 6            |
| Accessibility check passes                                                      | Phase 4 | NFR-A11Y-01  |
| Export and delete of a test person's data works                                 | Phase 4 | 5            |
| Load test within NFR-PERF-01; `pnpm audit` clean                                | Phase 6 | 3, 4         |
| Bug log and journey updated; no open critical or high security issues           | Now     | 3            |
