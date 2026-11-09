# HP-SAD-11 · Quality attributes

| Field       | Value                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-11                                                                                                        |
| Version     | 1.1                                                                                                              |
| Status      | Baselined for Phase 2                                                                                            |
| Date        | 2026-11-09                                                                                                       |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                 |
| Conforms to | ISO/IEC 25010:2023 (product quality model), SEI Architecture Tradeoff Analysis Method (ATAM), ISO/IEC/IEEE 42010 |

## 1. Purpose and scope

This document makes the non-functional requirements in [05 §6](05-requirements.md) testable and ties each to the architecture in [10](10-architecture.md). It uses the ATAM structure: a utility tree that ranks quality attributes, six-part scenarios that state each one precisely, the tactics chosen to meet them, and the sensitivity points, trade-offs and risks that follow. Each scenario names how it is verified in [15 Test strategy](15-test-strategy.md). Timing values are P-IDs from [00 Document control](00-document-control.md).

Limit of this analysis: I ran the ATAM steps myself, with the stakeholder concerns taken from [04](04-stakeholders-and-personas.md) and [10 §2](10-architecture.md#2-architecture-description-framework-isoiecieee-42010). A workshop with real shop owners and an outside architect is planned before Phase 6 and may re-rank the tree.

## 2. Business drivers

The architecture serves four drivers from [01 Vision](01-vision-and-scope.md) and [03 Business case](03-business-case.md):

1. **Trust.** A person must never be committed without their yes, and must never be shown a misleading offer. This is the product's floor.
2. **Interoperability.** Any A2A agent can talk to a Hitchpost agent, so the directory can grow beyond our own code.
3. **Low cost to run.** One maintainer, one neighborhood, small budget through Phase 6.
4. **Learning speed.** The wedge may change after the assumption tests, so the system must be cheap to change.

## 3. Utility tree

Ranks are (importance to the business, difficulty to achieve), each H, M or L. Scenarios ranked (H, H) get design attention first.

| Quality attribute (ISO/IEC 25010)     | Refinement                                       | Scenario | Rank   |
| ------------------------------------- | ------------------------------------------------ | -------- | ------ |
| Security: integrity                   | No commitment without approval                   | QAS-01   | (H, H) |
|                                       | Hostile peer can't mislead the person            | QAS-02   | (H, M) |
|                                       | Fake business can't be listed                    | QAS-03   | (H, H) |
| Security: resistance                  | Flooding can't take an agent down or hoard slots | QAS-04   | (H, M) |
| Reliability: fault tolerance          | No double bookings under concurrency             | QAS-05   | (H, H) |
|                                       | Retries never duplicate a booking                | QAS-06   | (H, M) |
| Reliability: availability             | Directory stays up                               | QAS-07   | (M, M) |
| Performance efficiency                | Fast offer round trip                            | QAS-08   | (M, L) |
|                                       | Bounded work per request                         | QAS-09   | (H, L) |
| Privacy (security: confidentiality)   | Share a slot, never a calendar                   | QAS-10   | (H, M) |
|                                       | Deletion on request                              | QAS-11   | (M, M) |
| Compatibility: interoperability       | Works with outside A2A agents                    | QAS-12   | (H, M) |
|                                       | Contract changes don't break peers               | QAS-13   | (M, M) |
| Interaction capability: accessibility | Approval usable by keyboard and screen reader    | QAS-14   | (H, M) |
| Maintainability: modifiability        | Swap the booking backend                         | QAS-15   | (M, M) |
|                                       | Every change verified                            | QAS-16   | (H, L) |
| Operability (observability)           | Trace one booking end to end                     | QAS-17   | (M, M) |

## 4. Quality attribute scenarios

Each scenario has the six ATAM parts. "Measure" is what a test or monitor checks.

| ID     | Source                       | Stimulus                                                                                                | Artifact                         | Environment                             | Response                                                                                               | Measure                                                                                            | NFR / FR                          |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| QAS-01 | Any code path or peer agent  | Attempts to send a `booking_request` without the person's approval                                      | Personal agent                   | Normal operation                        | Impossible: the only sending function requires an `Approval` that only the gate creates                | 0 compile-time paths; tests prove no booking without approval                                      | FR-GATE-01, FR-GATE-04            |
| QAS-02 | Hostile business agent       | Replies with a mismatched offer, escape codes, prose in a date, or absurd values                        | Personal agent parsers           | Normal operation                        | Reply refused; person sees only a fixed safe message                                                   | 100% of the audit's attack set refused (22 tests today)                                            | NFR-SEC-01, NFR-SEC-05, FR-MSG-04 |
| QAS-03 | Impostor                     | Registers a listing pointing at someone else's agent card                                               | Directory                        | Normal operation                        | Listing stays `pending`; card URL origin must match proven origin                                      | 0 unverified listings in search                                                                    | FR-DIR-01, FR-DIR-03              |
| QAS-04 | Scripted sender              | Sends 10,000 availability requests in a minute to hoard slots                                           | Business agent, directory        | Phase 2 onward                          | Requests above P-08 per sender get HTTP 429; no sender holds more than P-07 open offers                | p95 for other senders stays under 2 s; no customer is refused a slot because of one sender's holds | NFR-SEC-03, NFR-PERF-01           |
| QAS-05 | Two personal agents          | Send `booking_request` for the same slot within 1 ms, one while the shop is deciding on manual approval | Booking handler                  | Normal load; Phase 6 with two instances | Exactly one confirmed; the other `booking_rejected` `slot_taken`; a Reserved offer is never re-offered | 0 double bookings in 1,000 concurrent trials                                                       | NFR-REL-02, FR-BOOK-01            |
| QAS-06 | Personal agent               | Resends a `booking_request` after a timeout, including while the first is still pending                 | Booking handler                  | Network fault                           | Returns the existing Task (idempotent on `offerId`); no second booking                                 | 0 duplicates across retry tests                                                                    | NFR-REL-02, FR-BOOK-02            |
| QAS-07 | Infrastructure               | One instance of the directory crashes                                                                   | Directory service                | Production                              | Traffic served by the remaining instance; crashed one restarts                                         | 99.5% monthly availability                                                                         | NFR-REL-01                        |
| QAS-08 | Person                       | Asks for availability                                                                                   | Both agents                      | Production, normal load                 | Validated offer shown                                                                                  | p95 under 2 s request to validated offer                                                           | NFR-PERF-01                       |
| QAS-09 | Any sender                   | Requests the widest possible window on a fully booked book                                              | Slot search                      | Any                                     | Work capped by the 31-day window                                                                       | At most 1,488 slot checks per request                                                              | NFR-PERF-02, FR-MSG-07            |
| QAS-10 | Business agent               | Asks for anything beyond the slot (calendar, contacts)                                                  | Message contract                 | Any                                     | No message kind carries it; extra fields are dropped                                                   | 0 calendar or contact fields in any message kind                                                   | NFR-PRIV-01                       |
| QAS-11 | Person                       | Requests account deletion                                                                               | App, directory, ratings, backups | Production                              | Personal data erased across stores; backups expire per P-15                                            | Done within P-13; verified by a deletion test                                                      | NFR-PRIV-02                       |
| QAS-12 | Outside developer (Priya)    | Points a standard A2A v1.0 client at a Hitchpost agent                                                  | Business agent                   | Development                             | Card discovered at the standard path; JSON-RPC exchange works                                          | Conformance suite passes with the official SDK                                                     | NFR-INT-01                        |
| QAS-13 | Maintainer                   | Ships contract version 2                                                                                | Message contract                 | Production with mixed peers             | Peers declaring only the v1 extension keep working                                                     | v1 supported for P-18 after v2 ships; contract tests green                                         | FR-MSG-09                         |
| QAS-14 | Person using a screen reader | Receives an offer and approves it                                                                       | App approval sheet               | Phase 4 app                             | Offer announced; Approve and Decline reachable by keyboard; expiry shown as text                       | WCAG 2.2 AA automated audit clean plus manual pass                                                 | NFR-A11Y-01, FR-APP-02            |
| QAS-15 | Maintainer                   | Replaces the in-memory book with a shop's booking system over MCP                                       | Business agent                   | Development                             | Change confined to the booking tool adapter                                                            | No changes outside the adapter and its tests                                                       | FR-BOOK-06                        |
| QAS-16 | Contributor                  | Opens a pull request                                                                                    | Repository                       | CI                                      | Lint, type check and tests run; merge blocked if red                                                   | 100% of merges to `main` have a green run                                                          | NFR-MAINT-01, NFR-MAINT-02        |
| QAS-17 | Operator (Sam)               | Investigates a disputed booking                                                                         | Audit logs and traces            | Production                              | Every event for the booking found on both sides by `contextId`, `taskId`, `offerId`, `messageId`       | Full history retrieved in under 5 minutes                                                          | NFR-OBS-01                        |

## 5. Architectural tactics

| Scenario       | Tactic (SEI catalogue term)                                                                            | Where it lives in [10](10-architecture.md)                                        | Status                                   |
| -------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------- |
| QAS-01         | Limit access; capability token (the `Approval` type)                                                   | §5 Personal agent: approval gate, `bookOffer(approval)`                           | Phase 2                                  |
| QAS-02, QAS-10 | Validate input; sanitize output; minimal message contract                                              | §5 `ask.ts`, `booking.ts` parsers                                                 | Built                                    |
| QAS-03         | Authenticate actors; verify origin                                                                     | §5 Directory: verification worker                                                 | Phase 3                                  |
| QAS-04         | Limit event rate; cap open holds per sender                                                            | §5 business agent rate limiter and offer store; §8 abuse limits                   | Phase 2 (per IP), Phase 6 (per identity) |
| QAS-05         | Serialize conflicting writes in one transaction; database exclusion constraint over holds and bookings | §5 booking handler; §8 concurrency; [08 §4](08-data-design.md#4-storage-by-phase) | Phase 2, 6                               |
| QAS-06         | Idempotent operations keyed by `offerId` (`offerId → taskId`)                                          | §5 booking handler; §8 idempotency                                                | Phase 2                                  |
| QAS-07         | Redundancy (two instances); health checks; restart                                                     | §7 deployment view                                                                | Phase 6                                  |
| QAS-08, QAS-09 | Bound execution time; limit work per request; timeouts                                                 | §5 `findFreeSlot`, `MAX_WINDOW_DAYS` (P-06), `askForSlot` deadline (P-05)         | Built                                    |
| QAS-11         | Data lifecycle jobs; deletion propagation; backup expiry                                               | §8 persistence; [08 §5](08-data-design.md#5-retention)                            | Phase 6                                  |
| QAS-12, QAS-13 | Adhere to standards (A2A v1.0); versioned interface; tolerant reader                                   | §4 containers; [13 §2](13-interfaces.md#2-versioning-and-compatibility)           | Built (A2A), Phase 2 (versions)          |
| QAS-14         | Semantic markup; live regions; no colour-only cues                                                     | [13 §4](13-interfaces.md#4-client-app-phase-4), [14](14-user-interface-design.md) | Phase 4                                  |
| QAS-15         | Encapsulate; use an intermediary (adapter)                                                             | §5 booking tool adapter (conditional writes)                                      | Phase 6                                  |
| QAS-16         | Gate on automated checks                                                                               | `.github/workflows/ci.yml`                                                        | Built (enforced on first push)           |
| QAS-17         | Correlation ids from Phase 2; structured logging and distributed tracing in Phase 6                    | §8 observability; [18](18-deployment-and-operations.md)                           | Phase 2 (ids), Phase 6 (traces)          |

## 6. Analysis

### 6.1 Sensitivity points

A sensitivity point is a design choice that a quality attribute depends on heavily.

| ID   | Choice                                               | Attributes affected                                               |
| ---- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| SP-1 | Offer hold (P-01) and reserved hold (P-02)           | Reliability (QAS-05), usability, slot utilisation, abuse (QAS-04) |
| SP-2 | Window cap (P-06)                                    | Performance (QAS-09), usefulness for far-ahead bookings           |
| SP-3 | Strictness of the message parsers                    | Security (QAS-02), interoperability (QAS-12)                      |
| SP-4 | Where the check-and-write runs (process vs database) | Reliability (QAS-05), scalability                                 |
| SP-5 | Rate limit and hold cap per sender (P-08, P-07)      | Resistance (QAS-04), legitimate heavy users, shared IPs           |

### 6.2 Trade-offs

| ID   | Trade-off                                                                                  | Decision and reason                                                                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TO-1 | Strict parsing (security) against tolerance for slightly off peers (interoperability)      | Strict. A rejected peer gets a clear `rejected`; a misled person is worse. Tolerance applies only to unknown fields, which are dropped.                                            |
| TO-2 | Longer offer hold (person has time to decide) against shorter hold (chair free for others) | P-01 for the person's decision; the slot stays reserved only while the shop decides (P-02, P-03), so a manual approval never lets the hold lapse. Revisit with A-01 and A-02 data. |
| TO-3 | Typed messages (testable, safe) against natural language between agents (flexible)         | Typed. A language model may only produce a typed request on the person's side ([ADR 0010](../decisions/0010-typed-data-parts-before-llm.md)).                                      |
| TO-4 | Manual shop approval (owner control) against standing approval (speed)                     | Standing by default with a switch (FR-GATE-05); confirm in barber interviews (A-02).                                                                                               |
| TO-5 | One shared host for business agents (cost) against one host per business (isolation)       | Shared host, one subdomain per tenant so origins stay distinct, per-tenant signing keys (ADR 0014, ADR 0017).                                                                      |

### 6.3 Risks and non-risks

| ID   | Type     | Statement                                                                                                                                                                        | Linked                                   |
| ---- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| AR-1 | Risk     | The Phase 2 SQLite transaction is correct only while one process owns a book; running a second instance before the Phase 6 `slot_claims` constraint would allow double bookings. | QAS-05, SP-4, Phase 6                    |
| AR-2 | Risk     | Free-text fields (`service`, `reason`) are safe to display but not safe to feed a language model unguarded.                                                                      | QAS-02, [12](12-security-and-privacy.md) |
| AR-3 | Risk     | UTC-only, whole-hour opening hours give wrong slots for real shops until ADR 0018 lands in Phase 6; no real booking happens before then.                                         | FR-BOOK-05, ADR 0018                     |
| AR-4 | Risk     | Unsigned agent cards let anyone who controls a URL impersonate an agent until signed cards and auth land.                                                                        | NFR-SEC-02, QAS-03                       |
| AR-5 | Risk     | Until agent auth (Phase 6) the `contextId` is a bearer capability: anyone who learns it can book, cancel or reschedule in that conversation.                                     | T-04, [12](12-security-and-privacy.md)   |
| AR-6 | Risk     | A booking system reached over MCP that cannot do a conditional write can double book against walk-ins entered there.                                                             | QAS-05, QAS-15, FR-BOOK-06               |
| NR-1 | Non-risk | Bounded work per request: the 31-day cap and slot grid make worst-case search cost fixed and small.                                                                              | QAS-09                                   |
| NR-2 | Non-risk | Standard A2A v1.0 via the official SDK: interoperability doesn't rest on our own protocol code.                                                                                  | QAS-12                                   |
| NR-3 | Non-risk | Approval as a type: bypassing the gate needs a deliberate type-system workaround that review and tests would catch.                                                              | QAS-01                                   |

## 7. Verification

| Scenario               | How it is verified ([15](15-test-strategy.md))                                                                | Status today                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| QAS-01                 | Unit tests that booking can't be reached without an `Approval`; approval for offer A can't book offer B       | Phase 2                                       |
| QAS-02, QAS-10         | Adversarial parser tests and end-to-end tests with a sneaky barber agent                                      | Built (`booking.test.ts`, `ask.test.ts`)      |
| QAS-03                 | Directory integration tests: origin mismatch refused, unverified listings not searchable                      | Phase 3                                       |
| QAS-04, QAS-07, QAS-08 | Load test on staging; SLO monitors in production                                                              | Phase 6                                       |
| QAS-05, QAS-06         | Concurrency, manual-approval and retry tests in `packages/e2e`; two-instance test against Postgres in Phase 6 | Phase 2, 6                                    |
| QAS-09                 | Window cap and bounded-search tests                                                                           | Built                                         |
| QAS-11                 | Deletion propagation test across stores                                                                       | Phase 6                                       |
| QAS-12, QAS-13         | Conformance suite with the official SDK; versioned contract tests                                             | Built (SDK on both sides), Phase 2 (versions) |
| QAS-14                 | Automated accessibility audit plus a manual screen-reader pass                                                | Phase 4                                       |
| QAS-15                 | Adapter contract test run against the in-memory book and the MCP adapter                                      | Phase 6                                       |
| QAS-16                 | Branch protection requiring the `lint, typecheck, test` check                                                 | Workflow Built; enforced on first push        |
| QAS-17                 | Audit reconciliation test on correlation ids (Phase 2); operational drill tracing a seeded booking (Phase 6)  | Phase 2, 6                                    |

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                   | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 1.0     | 2026-11-09 | First baseline                                                                                                                                                                                                           | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: scenarios aligned to the corrected booking protocol, hold caps, idempotency, correlation ids, P-IDs, section references, stated limits of a self-run ATAM, new risks AR-5 and AR-6 | S. Jannisar |
