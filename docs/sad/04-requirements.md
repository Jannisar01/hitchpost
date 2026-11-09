# 04. Requirements specification

What Hitchpost must do and how well, from what exists today (Phase 1 plus the audit fixes) through production. Each requirement has an ID, a phase, a status and a source, and traces to a use case, a design section and a test.

## 1. Purpose and scope

**In scope:** agent-to-agent appointment booking for one vertical (barbers, [ADR 0008](../decisions/0008-first-vertical-barbers.md)): asking for availability, a human approval gate, booking and changing bookings, a public directory of business agents, a client app with agents as contacts, and ratings from verified interactions.

**Out of scope until Later:** payments and deposits, verticals other than appointment booking, a natural-language front end, federation between directories. See [01. Vision and scope](01-vision-and-scope.md).

## 2. Definitions

| Term                 | Meaning                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Agent                | Software that acts for one party (a person or a business) and speaks A2A.                         |
| Agent card           | The A2A document at `/.well-known/agent-card.json` that says who an agent is and how to reach it. |
| Offer                | A barber agent's proposal of one slot: service, start, duration, price, currency, `offerId`.      |
| Approval             | A person's explicit yes to one specific offer.                                                    |
| Commitment           | Any action that spends a person's money, books their time or shares their personal data.          |
| Verified interaction | An exchange recorded in both sides' audit logs that ended in a booking, a decline or a no-show.   |
| Inbound data         | Anything received from another agent. Always untrusted.                                           |

## 3. Constraints and assumptions

**Constraints**

- Agent-to-agent messaging uses A2A v1.0 through the official SDK ([ADR 0003](../decisions/0003-build-on-a2a-and-mcp.md)).
- TypeScript on Node 24, one monorepo ([ADR 0002](../decisions/0002-typescript-monorepo.md)).
- Messages between agents are typed data parts, not free text ([ADR 0010](../decisions/0010-typed-data-parts-before-llm.md)).
- MIT licensed, built in the open ([ADR 0004](../decisions/0004-mit-open-source.md)).

- No payments or deposits in v1 (R-09 in [02](02-business-case.md)).
- Agents exchange times as UTC on the wire; each business has an IANA time zone for its opening hours.
- Every Hitchpost message carries the contract version `hitchpost/1` from Phase 2 ([09](09-interfaces.md)).

**Assumptions:** the business assumptions this specification rests on are tracked with their tests in [02. Business case](02-business-case.md). If one fails, the requirements that depend on it are revisited, not built anyway.

| Assumption                                                  | Requirements that depend on it      |
| ----------------------------------------------------------- | ----------------------------------- |
| A-01 people will approve agent offers                       | FR-GATE-_, FR-BOOK-_                |
| A-02, A-03 barbers list; their tools allow reads and writes | FR-DIR-01, FR-BOOK-06               |
| A-04 agent booking is faster                                | NFR-PERF-01, the whole Phase 2 flow |
| A-06 verified reviews are trusted more                      | FR-RATE-*                           |
| A-08 the built-in personal agent is enough at launch        | FR-APP-03                           |

## 4. Functional requirements

Status is **Built** (with where it lives and the test that proves it), **Phase N** or **Later**. Sources: **NB** = notebook sketch, **ADR** = decision record, **Audit** = [Phase 1 audit](../audits/2026-11-08-phase-1.md).

### 4.1 Agent messaging (MSG)

| ID        | Requirement                                                                                                                                                                                                      | Phase | Status                                                                                                                                                                                                                                                               | Source                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR-MSG-01 | A business agent must publish an A2A agent card describing its name, interface URL and skills.                                                                                                                   | 1     | **Built.** `barberCard` in `packages/barber-agent/src/server.ts`; exercised by every end-to-end test in `packages/my-agent/src/ask.test.ts` through card discovery.                                                                                                  | NB, ADR 0003           |
| FR-MSG-02 | A business agent must answer an `availability_request` with exactly one of `offer`, `no_availability` or `rejected`.                                                                                             | 1     | **Built.** `BarberExecutor.reply` in `packages/barber-agent/src/executor.ts`. Tests: "my agent asks, the barber agent offers the first free slot", "the barber agent says so when nothing is free", "the barber agent rejects a free text message".                  | NB                     |
| FR-MSG-03 | Every agent must validate inbound agent data against a strict schema and rebuild it from known fields, dropping unknown fields.                                                                                  | 1     | **Built.** `parseAvailabilityRequest`, `parseBarberReply` in `packages/core/src/booking.ts`. Tests: "rejects bad availability requests", "rejects bad barber replies", "drops fields it does not know", "parses each kind of barber reply and drops unknown fields". | ADR 0007, Audit        |
| FR-MSG-04 | A requesting agent must reject an offer that does not match its request (same service, start inside the requested window).                                                                                       | 1     | **Built.** `offerMatches` in `packages/core/src/booking.ts`, used in `askForSlot` (`packages/my-agent/src/ask.ts`). Tests: "an offer only matches the request it answers", "my agent refuses an offer that doesn't answer its request".                              | Audit                  |
| FR-MSG-05 | A requesting agent must bound the whole exchange (card discovery and message) by one timeout and refuse redirects.                                                                                               | 1     | **Built.** `askForSlot` deadline and `redirect: "error"`. Test: "my agent gives up on an agent that never answers".                                                                                                                                                  | Audit                  |
| FR-MSG-06 | Times must be strict ISO 8601 with an explicit zone, rejected if the day doesn't exist, and stored as canonical UTC.                                                                                             | 1     | **Built.** `toInstant` in `packages/core/src/booking.ts`. Tests: "normalizes instants with an offset to UTC", "rejects bad availability requests".                                                                                                                   | Audit                  |
| FR-MSG-07 | An availability window must be positive and at most 31 days long.                                                                                                                                                | 1     | **Built.** `MAX_WINDOW_DAYS` in `packages/core/src/booking.ts`. Test: "rejects bad availability requests".                                                                                                                                                           | Audit                  |
| FR-MSG-08 | A requesting agent must not send a request it cannot validate itself.                                                                                                                                            | 1     | **Built.** `askForSlot` validates before sending. Test: "my agent won't send a request it can't validate itself".                                                                                                                                                    | Audit                  |
| FR-MSG-09 | Every agent card must declare the contract versions it accepts (`hitchpost/1` from Phase 2); a sender must use the highest version both sides share, and an agent must answer an unknown `kind` with `rejected`. | 2     | Phase 2                                                                                                                                                                                                                                                              | [09](09-interfaces.md) |
| FR-MSG-10 | Questions (availability) must use A2A Messages; commitments (book, cancel, reschedule) must use A2A Tasks so each has a durable id.                                                                              | 2     | Phase 2. Availability already uses a Message reply (`executor.ts`).                                                                                                                                                                                                  | [09](09-interfaces.md) |

### 4.2 Booking lifecycle (BOOK)

| ID         | Requirement                                                                                                                                                                                                                                                                                                                                                                                    | Phase | Status                                                                                                                                                                                                                                                                                     | Source             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| FR-BOOK-01 | A barber agent must store every offer it issues (`offerId`, `contextId`, service, start, price, `expiresAt`), send `expiresAt` with the offer, and hold the slot until the offer expires or is used.                                                                                                                                                                                           | 2     | Phase 2                                                                                                                                                                                                                                                                                    | Audit              |
| FR-BOOK-02 | A barber agent must answer a `booking_request` carrying an `offerId` with a Task that ends `booking_confirmed` or `booking_rejected` (`expired`, `unknown_offer`, `slot_taken`, `other`), decided in one atomic step: the offer exists, is unexpired, belongs to the same `contextId`, and the slot is still free. A repeated request for an already-confirmed offer returns the same booking. | 2     | Phase 2                                                                                                                                                                                                                                                                                    | Audit              |
| FR-BOOK-03 | A customer must be able to cancel (`cancel_request` → `cancelled`) or reschedule (`reschedule_request` → a new `offer`, then the normal approve and book flow) through their agent, and the barber's book must update.                                                                                                                                                                         | 2     | Phase 2                                                                                                                                                                                                                                                                                    | NB                 |
| FR-BOOK-04 | Slot finding must never offer a slot that overlaps an existing booking, falls outside opening hours or starts in the past.                                                                                                                                                                                                                                                                     | 1     | **Built.** `findFreeSlot` in `packages/barber-agent/src/book.ts`. Tests: "a longer service never runs into the next booking", "a booking off the 30 minute grid still blocks the slots it covers", "a service may end exactly at closing, never after", "never offers a slot in the past". | Audit              |
| FR-BOOK-05 | Each business must have an IANA time zone; opening hours are evaluated in it, including daylight-saving changes, while times on the wire stay UTC.                                                                                                                                                                                                                                             | 6     | Phase 6 (UTC only today, [ADR 0011](../decisions/0011-in-memory-appointment-book.md))                                                                                                                                                                                                      | Audit              |
| FR-BOOK-06 | A barber agent must read and write the shop's real booking system through MCP instead of the in-memory book.                                                                                                                                                                                                                                                                                   | 6     | Phase 6                                                                                                                                                                                                                                                                                    | ADR 0003, ADR 0011 |

### 4.3 Approval gate (GATE)

| ID         | Requirement                                                                                                                                                                                                                                 | Phase | Status                                                    | Source                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------- | --------------------------------- |
| FR-GATE-01 | No agent may make a commitment for a person without that person's explicit approval.                                                                                                                                                        | 2     | Phase 2. Today agents only offer; nothing can be booked.  | NB, ADR 0007                      |
| FR-GATE-02 | An approval must be bound to exactly one offer (`offerId` and `contextId`) and must expire with that offer. An approval for one offer can never book another.                                                                               | 2     | Phase 2                                                   | ADR 0007, Audit                   |
| FR-GATE-03 | Both sides must keep an append-only audit log of offers, decisions (with timestamp), booking requests and results.                                                                                                                          | 2     | Phase 2                                                   | ADR 0007                          |
| FR-GATE-04 | The only code path that sends a `booking_request` must take an `Approval`, a type only the gate can create; the type system must make it impossible to book without one.                                                                    | 2     | Phase 2                                                   | Audit (architecture review)       |
| FR-GATE-05 | On the business side, opening hours count as standing approval by default. A per-shop switch must let the owner approve each booking manually; the booking Task then waits in input-required state until the owner decides or it times out. | 2     | Phase 2 (open decision, see [01](01-vision-and-scope.md)) | Audit (open question in ADR 0007) |

### 4.4 Directory (DIR)

| ID        | Requirement                                                                                                                                                                                | Phase | Status  | Source                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ------- | ----------------------- |
| FR-DIR-01 | A business must be able to register its agent (`POST /v1/listings`), and the listing is published only after it proves control of the agent's origin (well-known token or DNS TXT record). | 3     | Phase 3 | NB, insights            |
| FR-DIR-02 | People and agents must be able to search the directory by business name, service and area (`GET /v1/listings`, [09](09-interfaces.md)).                                                    | 3     | Phase 3 | NB                      |
| FR-DIR-03 | A listing must point to the business's agent card, and the card's interface URL must have the same origin as the listing. Mismatches are refused.                                          | 3     | Phase 3 | Audit (security review) |
| FR-DIR-04 | A business must be able to update or remove its own listing.                                                                                                                               | 3     | Phase 3 |                         |
| FR-DIR-05 | Each listing must show its verification status and rating summary.                                                                                                                         | 5     | Phase 5 | NB                      |

### 4.5 Client app (APP)

| ID        | Requirement                                                                                                                                          | Phase | Status                                                                                   | Source                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------- | ---------------------- |
| FR-APP-01 | A person's contacts in the app must be agents (business agents from the directory, or any A2A agent by URL).                                         | 4     | Phase 4                                                                                  | NB                     |
| FR-APP-02 | The approval screen must show only validated offer data, rendered as plain text, and must state that nothing is booked until the person approves.    | 4     | Phase 4. The CLI already prints only validated fields (`packages/my-agent/src/main.ts`). | Audit                  |
| FR-APP-03 | The app must include a built-in personal agent; it is the consumer agent at launch, so a person can use Hitchpost without bringing their own (A-08). | 4     | Phase 4                                                                                  | Audit (product review) |
| FR-APP-04 | A person must see their upcoming bookings and be able to reschedule or cancel them.                                                                  | 4     | Phase 4                                                                                  |                        |
| FR-APP-05 | A person must be able to block or remove an agent contact.                                                                                           | 4     | Phase 4                                                                                  |                        |

### 4.6 Ratings (RATE)

| ID         | Requirement                                                                                                                                                | Phase | Status  | Source       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------- | ------------ |
| FR-RATE-01 | Only verified interactions may be rated; each interaction may be rated once per side.                                                                      | 5     | Phase 5 | NB, insights |
| FR-RATE-02 | The system must compute structured agent-behaviour metrics from audit logs: response time, offer honoured, stayed within its card's skills, approval rate. | 5     | Phase 5 | NB           |
| FR-RATE-03 | A person may add a short human review to a verified interaction; it is shown separately from the behaviour metrics.                                        | 5     | Phase 5 | NB           |

### 4.7 Operator and moderation (ADMIN)

| ID          | Requirement                                                                                                                                         | Phase                    | Status      | Source   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------- | -------- |
| FR-ADMIN-01 | Anyone must be able to report an agent; an operator must be able to suspend or remove a listing, and the business must be notified with the reason. | 5 (report), 6 (takedown) | Phase 5 / 6 | insights |
| FR-ADMIN-02 | An operator must be able to see an audit trail of moderation actions.                                                                               | 6                        | Phase 6     |          |

## 5. User stories for the next phases

### Phase 2

**FR-GATE-01, FR-GATE-02.** As Dana, I want to approve one specific offer, so that my agent can never book something I didn't see.

- **Given** my agent received a valid offer for a haircut on Thursday at 17:30 for 30.00 USD, **when** I approve it, **then** my agent sends a `booking_request` for that `offerId` only, and the approval is recorded in my audit log.
- **Given** I approved offer A, **when** any code tries to book offer B with that approval, **then** it is refused and nothing is sent.
- **Given** the offer has expired, **when** I approve it, **then** my agent tells me it expired and asks the barber agent for a fresh offer.

**FR-BOOK-01, FR-BOOK-02.** As Marcus, I want offers to hold the slot briefly, so that two customers aren't offered the same chair at the same time.

- **Given** the barber agent offered 17:30 to Dana, **when** another agent asks for the same window before the offer expires, **then** 17:30 is not offered.
- **Given** a `booking_request` with an unknown, expired or mismatched `offerId`, **when** it arrives, **then** the barber agent answers `booking_rejected` (`unknown_offer` or `expired`) and its book is unchanged.
- **Given** two `booking_request`s for the same slot arrive together, **when** both are processed, **then** exactly one is confirmed.

**FR-GATE-03.** As Dana or Marcus, I want a record of what my agent proposed and what was decided, so that I can check what happened if something goes wrong.

- **Given** a completed booking, **when** I read my audit log, **then** it shows the offer, my decision with a timestamp, the booking request and the result, in order, with no entries changed or removed.

**FR-BOOK-03.** As Dana, I want to cancel through my agent, so that I don't have to call the shop.

- **Given** a confirmed booking, **when** I cancel it, **then** the barber's book frees the slot, both audit logs record the cancellation, and the slot can be offered again.

### Phase 3

**FR-DIR-01.** As Marcus, I want to list my shop's agent, so that customers' agents can find me.

- **Given** I submit my agent card URL and place the verification token on that origin (or its DNS), **when** verification runs, **then** the listing goes live marked as verified.
- **Given** I can't prove control, **when** I submit, **then** the listing is not published.

**FR-DIR-02.** As Dana, I want to find a barber near me who does fades, so that my agent can ask them for a slot.

- **Given** listings exist, **when** I search for "fade" near my area, **then** I get matching verified listings with their agent card links, nearest first.

**FR-DIR-03.** As Dana, I want my agent to talk only to the business I picked, so that a listing can't redirect me somewhere else.

- **Given** a listing at `https://shop.example`, **when** its card's interface URL points at another origin, **then** my agent refuses to send it anything and the directory flags the listing.

## 6. Non-functional requirements

| ID           | Requirement                                                                    | Target                                                                                      | Phase | Status                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SEC-01   | Inbound agent data is untrusted and strictly validated before any use.         | 100% of inbound message types have a parser and rejection tests.                            | 1     | **Built** for all four current message types (`packages/core/src/booking.ts`).                                                                                             |
| NFR-SEC-02   | Agents authenticate each other (signed agent cards, tokens).                   | Unsigned or unverifiable agents can't book.                                                 | 6     | Phase 6                                                                                                                                                                    |
| NFR-SEC-03   | Rate limits per sender on every agent and directory endpoint.                  | Default 60 requests per minute per sender; over-limit gets HTTP 429.                        | 6     | Phase 6                                                                                                                                                                    |
| NFR-SEC-04   | No stack traces, file paths or server banners in responses.                    | Zero in an automated probe of error paths.                                                  | 1     | **Built.** Error handler and `x-powered-by` off in `packages/barber-agent/src/server.ts`.                                                                                  |
| NFR-SEC-05   | Text shown to a person contains no control characters.                         | All displayed fields pass `SAFE_TEXT`.                                                      | 1     | **Built.** `SAFE_TEXT` in `packages/core/src/booking.ts`; test "rejects bad barber replies".                                                                               |
| NFR-PRIV-01  | Data minimisation: an agent shares a slot, never a calendar.                   | No message type carries calendar contents or contact details beyond what the booking needs. | 1     | **Built** for current messages; reviewed for each new message type.                                                                                                        |
| NFR-PRIV-02  | Personal data has a documented retention period and can be deleted on request. | Deletion within 30 days of request.                                                         | 6     | Phase 6                                                                                                                                                                    |
| NFR-PERF-01  | Offer round trip (request to validated offer).                                 | p95 under 2 s on the hosted service.                                                        | 6     | Locally the end-to-end test runs in about 150 ms; not yet measured hosted.                                                                                                 |
| NFR-PERF-02  | One request can only cause bounded work.                                       | Slot search covers at most 31 days (1,488 slots).                                           | 1     | **Built** (`MAX_WINDOW_DAYS`).                                                                                                                                             |
| NFR-REL-01   | Directory availability.                                                        | 99.5% monthly.                                                                              | 6     | Phase 6                                                                                                                                                                    |
| NFR-REL-02   | No lost or duplicated bookings.                                                | Zero double bookings in concurrency tests; audit log survives restarts.                     | 2     | Phase 2                                                                                                                                                                    |
| NFR-OBS-01   | Structured logs and traces with a correlation id across both agents.           | Every booking traceable end to end by one id.                                               | 6     | Phase 6                                                                                                                                                                    |
| NFR-A11Y-01  | Client app accessibility.                                                      | WCAG 2.2 AA, checked by automated audit and a manual screen-reader pass.                    | 4     | Phase 4                                                                                                                                                                    |
| NFR-INT-01   | A2A compliance.                                                                | Works with the official A2A SDK v1.x on both sides; card at the standard path.              | 1     | **Built.** `@a2a-js/sdk` 1.3 (A2A v1.0) in both agents.                                                                                                                    |
| NFR-MAINT-01 | CI gates on every change.                                                      | Lint, type check and tests required to merge to `main`.                                     | 0     | Workflow written (`.github/workflows/ci.yml`); enforced once the repository is pushed and branch protection is on ([ADR 0005](../decisions/0005-ci-and-review-policy.md)). |
| NFR-MAINT-02 | Every new behaviour ships with a test.                                         | New logic without a test is not merged.                                                     | 0     | Policy in [CONTRIBUTING.md](../../CONTRIBUTING.md).                                                                                                                        |

## 7. Traceability matrix

Design sections refer to [06. Architecture](06-architecture.md), [07. Data design](07-data-design.md), [08. Security and privacy](08-security-and-privacy.md) and [09. Interfaces](09-interfaces.md). Tests named in quotes exist today; others are planned in [10. Test strategy](10-test-strategy.md). Planned end-to-end tests live in the new `packages/e2e`; directory, app and ratings tests in `packages/directory`, `packages/app` and `packages/ratings`.

| Requirement                         | Use case            | Design                                   | Test                                                                                                                                                          |
| ----------------------------------- | ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-MSG-01                           | UC-01               | 09 agent card                            | All end-to-end tests in `ask.test.ts` (card discovery)                                                                                                        |
| FR-MSG-02                           | UC-01               | 09 message contract                      | "my agent asks, the barber agent offers the first free slot"; "the barber agent says so when nothing is free"; "the barber agent rejects a free text message" |
| FR-MSG-03                           | UC-01               | 08 trust boundaries; 09 message contract | "rejects bad availability requests"; "rejects bad barber replies"; "drops fields it does not know"                                                            |
| FR-MSG-04                           | UC-01               | 06 booking sequence                      | "an offer only matches the request it answers"; "my agent refuses an offer that doesn't answer its request"                                                   |
| FR-MSG-05                           | UC-01               | 08 client hardening                      | "my agent gives up on an agent that never answers"                                                                                                            |
| FR-MSG-06, FR-MSG-07                | UC-01               | 09 message contract                      | "normalizes instants with an offset to UTC"; "rejects bad availability requests"                                                                              |
| FR-BOOK-04                          | UC-01               | 07 appointment book                      | `book.test.ts` (all 9 tests)                                                                                                                                  |
| FR-MSG-09, FR-MSG-10                | UC-02, UC-04        | 09 message contract, A2A usage           | Planned (`packages/e2e`): unknown version rejected; booking returns a Task                                                                                    |
| FR-BOOK-01, FR-BOOK-02              | UC-02               | 06 booking sequence; 07 offer store      | Planned: offer hold, expired and mismatched offers, concurrent booking                                                                                        |
| FR-BOOK-03                          | UC-04               | 06 booking sequence                      | Planned: cancel frees slot, reschedule                                                                                                                        |
| FR-GATE-01, FR-GATE-02, FR-GATE-04  | UC-02, UC-03        | 06 approval gate component               | Planned: no booking without approval; approval for A can't book B                                                                                             |
| FR-GATE-03                          | UC-02, UC-03, UC-04 | 07 audit log                             | Planned: log is append-only and complete for each flow                                                                                                        |
| FR-DIR-01, FR-DIR-04                | UC-05               | 06 directory service; 07 listing         | Planned: verified registration, unverified refused                                                                                                            |
| FR-DIR-02                           | UC-06               | 09 directory API                         | Planned: search by name, service, area                                                                                                                        |
| FR-DIR-03                           | UC-06, UC-07        | 08 directory trust                       | Planned: origin mismatch refused                                                                                                                              |
| FR-APP-01, FR-APP-03, FR-APP-05     | UC-07               | 06 client app; 09 screens                | Planned: app end-to-end                                                                                                                                       |
| FR-APP-02                           | UC-02               | 09 approval screen                       | Planned: only validated fields rendered                                                                                                                       |
| FR-RATE-01, FR-RATE-02, FR-RATE-03  | UC-08               | 07 ratings                               | Planned: unverified interaction can't be rated                                                                                                                |
| FR-ADMIN-01, FR-ADMIN-02            | UC-09, UC-10        | 06 operator tools                        | Planned: report, suspend, notify                                                                                                                              |
| NFR-SEC-01, NFR-SEC-05              | UC-01               | 08 trust boundaries                      | `booking.test.ts`                                                                                                                                             |
| NFR-SEC-04                          | UC-01               | 08 server hardening                      | Audit probe (oversized body returns plain JSON); planned as an automated test                                                                                 |
| NFR-PERF-01, NFR-REL-01, NFR-OBS-01 | All                 | 11 operations                            | Planned: load test and SLO monitoring                                                                                                                         |
| NFR-A11Y-01                         | UC-07               | 09 screens                               | Planned: automated audit plus manual pass                                                                                                                     |
| NFR-MAINT-01                        | All                 | 11 CI/CD                                 | CI workflow on each PR                                                                                                                                        |
