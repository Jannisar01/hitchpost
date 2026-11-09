# HP-SAD-01 · Vision and scope

| Field       | Value                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-01                                                                                                               |
| Version     | 1.1                                                                                                                     |
| Status      | Baselined for Phase 2                                                                                                   |
| Date        | 2026-11-09                                                                                                              |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                        |
| Conforms to | ISO/IEC/IEEE 29148:2018 (business requirements: mission, goals, scope); ISO/IEC/IEEE 15288 business or mission analysis |

## 1. Vision statement

Any person's agent can find a local business's agent, ask it a question and get a real offer back. The person then says yes or no, and the booking lands correctly on both sides with a record both can check.

For v1 that means: Dana's agent books Marcus's barbershop over an open protocol. Nothing is committed without Dana's approval, and Marcus's book never double-books.

## 2. Problem

1. **Agents connect to software, not to each other.** A personal agent that wants to book a haircut has to drive a booking website built for humans, or hand the job back to the person. The barber's systems already know the answer, but nothing lets one agent ask another directly.
2. **Small businesses lose bookings to friction.** A barber cutting hair can't answer the phone. Booking apps help, but each is its own silo with its own app and login.
3. **There is no trusted way to find or judge a business's agent.** Even when a business has an agent, nobody can look it up, check that it's really that business, or see how it has behaved before.

## 3. Goals

| ID  | Goal                                                                         | Measured by                                                                                                               |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| G-1 | A person can book a real appointment through their agent with one approval   | Approved bookings that were honored (north star)                                                                          |
| G-2 | A business can list its agent quickly without changing its booking tool      | Time from signup to first offer sent, measured on pilot shops: median at most 30 minutes, 90th percentile at most 2 hours |
| G-3 | Agents can only commit a person after an explicit yes                        | Zero bookings without a logged approval (audit check)                                                                     |
| G-4 | People can tell a real, well-behaved business agent from a fake or a bad one | Share of bookings made with verified listings; report rate                                                                |
| G-5 | Any A2A agent can take part, not only ours                                   | At least one third-party agent completing a booking by Phase 6                                                            |

## 4. Non-goals

- **Inventing a protocol.** Agents talk over A2A; tools over MCP ([ADR 0003](../decisions/0003-build-on-a2a-and-mcp.md)).
- **Replacing booking platforms.** Hitchpost sits beside the barber's existing tool and reads and writes through it.
- **Payments and deposits in v1.** They bring card-data and consumer-protection rules. Later, if bookings work without them.
- **Autonomous booking without approval.** Not a default, ever ([ADR 0007](../decisions/0007-human-approval-gate.md)). A per-contact opt-in may come later.
- **Free-form chat between language models.** Agents exchange typed messages; a language model may turn a person's words into a request, but never decides what gets booked ([ADR 0010](../decisions/0010-typed-data-parts-before-llm.md)).
- **Verticals beyond appointment booking before v1** ([ADR 0008](../decisions/0008-first-vertical-barbers.md)).

## 5. Product principles

1. **The approval gate is the trust floor, not the moat.** Other agent products also ask before acting. What I add is a gate that sits between _two parties'_ agents and is logged for both sides.
2. **The moat is the directory plus reputation from verified interactions.** A listing is only worth something if people can find it and trust it, and trust is earned from bookings that really happened.
3. **Other agents are strangers.** Every inbound message is untrusted data, validated and rebuilt before use. Nothing is acted on from free text.
4. **Share the minimum.** My agent shares a free slot, not my calendar. The barber's agent shares an offer, not its book.
5. **Open by default.** MIT code, open protocol, portable listings ([ADR 0004](../decisions/0004-mit-open-source.md)).
6. **Prove it narrow before going wide.** One vertical, one neighborhood, real bookings.

## 6. Success metrics

### North star

**Weekly human-approved bookings that were honored**: bookings approved by the person that reached the outcome Completed, as marked by the shop or confirmed by the customer ([FR-RATE-04](05-requirements.md#46-ratings-and-outcomes-rate)). No-shows are recorded as NoShow and cancelled bookings as Cancelled; neither counts. Counting only Completed bookings stops the metric from rewarding junk bookings or no-shows.

### Counter-metrics (must not get worse while the north star grows)

| Metric                                                        | Why it matters                                    | Phase |
| ------------------------------------------------------------- | ------------------------------------------------- | ----- |
| First-offer rejection rate                                    | High means offers don't fit what people asked for | 2     |
| Median time to approve                                        | Long means the approval step is a chore           | 2     |
| Booking errors (double-booked, cancelled by shop, wrong time) | Directly breaks trust on both sides               | 2     |
| Reports per 100 interactions                                  | Abuse and fake listings                           | 5     |
| Repeat use per person within 60 days                          | One-off novelty vs a real habit                   | 4     |

### Baseline to measure before Phase 2 ships

Time-to-book today, by phone, website or app, measured on myself and 5 other people for a haircut in the same week. Without this baseline, "faster booking" is not a claim I can make. It's recorded as assumption A-04 in the [business case](03-business-case.md).

## 7. Scope by phase

| Phase            | In scope                                                                                                                                                                                   | Out of scope                                          | Status                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | -------------------------------------- |
| 0. Foundation    | Repo, MIT license, CI, review bot config, decision log                                                                                                                                     | Hosting                                               | Built locally; first push pending      |
| 1. Agent line    | Barber agent with Agent Card and in-memory book; my agent asks and validates offers; strict validation                                                                                     | Booking, approvals, real calendars                    | Built ([`packages/`](../../packages/)) |
| 2. Approval gate | Stored offers with expiry, booking request bound to an offer, human yes or no, booking written, audit log on both sides, decline and ask again, cancel and reschedule                      | Directory, app UI, payments                           | Phase 2                                |
| 3. Directory     | Business registration, origin verification, search by name, area and service                                                                                                               | Ratings, paid placement, signed Agent Cards (Phase 6) | Phase 3                                |
| 4. Client app    | WhatsApp-style app; built-in personal agent as the consumer agent at launch; contacts are agents; approve in the app                                                                       | Third-party consumer agents as a requirement          | Phase 4                                |
| 5. Ratings       | Two-sided reviews only from verified interactions; behavior signals (answered, honored, stayed in scope); reporting                                                                        | Review moderation at scale                            | Phase 5                                |
| 6. Production    | Hosting, signed Agent Cards and auth between agents, per-identity rate limits, monitoring, backups, one real booking system over MCP, time zones, 5 to 10 real barbers in one neighborhood | Multiple cities, payments                             | Phase 6                                |
| Later            | Language-model front end, more verticals, deposits, per-contact auto-approve, federation of directories                                                                                    |                                                       | Later                                  |

## 8. v1 release criteria (end of Phase 6)

v1 ships only when all of these hold. The test-based evidence for each is the release exit criteria in [15 §11](15-test-strategy.md#11-release-exit-criteria); criterion 2 is measured in the pilot.

1. **Correctness:** 4 consecutive weeks with zero double-bookings and zero bookings without a logged approval.
2. **Real use:** at least 5 barbers listed and verified in one neighborhood; at least 50 honored (Completed) bookings in the last 4 weeks; at least 30% of people who booked once have booked again.
3. **Security:** no open high or critical findings from a fresh audit; signed agent cards, agent-to-agent auth and per-identity rate limits on; dependency audit clean in CI.
4. **Operations:** monitoring and alerts on the booking path; a restore from backup tested; an incident runbook used at least once in a drill.
5. **Privacy:** published privacy notice; data retention enforced in code; a person can export and delete their data.
6. **Interop:** at least one agent not written by me completes a booking through the directory.

If criterion 2 can't be met after Phase 4, the business case kill criteria apply before more is built.

## 9. Supersedes and related

Supersedes the product sections of [insights.md](../insights.md) and the "pieces" table in [concept.md](../concept.md). Related: [03 business case](03-business-case.md), [04 stakeholders and personas](04-stakeholders-and-personas.md), [05 requirements](05-requirements.md).

## Revision history

| Version | Date       | Change                                                                                                                                                                                 | Author      |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0.1     | 2026-11-08 | First draft                                                                                                                                                                            | S. Jannisar |
| 1.0     | 2026-11-09 | Baselined: renumbered into lifecycle order, formal document control, standards conformance                                                                                             | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: measurable G-2, north star defined as Completed bookings, signed Agent Cards moved to Phase 6, v1 criteria linked to release exit criteria in 15 | S. Jannisar |
