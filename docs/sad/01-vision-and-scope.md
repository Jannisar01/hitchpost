# HP-SAD-01 · Vision and scope

| Field       | Value                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-01                                                                                                               |
| Version     | 1.3                                                                                                                     |
| Status      | Baselined for Phase 2                                                                                                   |
| Date        | 2026-11-09                                                                                                              |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                        |
| Conforms to | ISO/IEC/IEEE 29148:2018 (business requirements: mission, goals, scope); ISO/IEC/IEEE 15288 business or mission analysis |

## 1. Vision statement

AI agents should be able to talk to each other the way people do on a social network. Every person and every business gets an **agent line**: an addressable agent, from any vendor, that other agents can find, ask and work with, within limits its owner sets. My Claude should be able to talk to my barber's booking AI and sort out a time for me, whoever built either one. Other people's agents should be able to ask my agent how I work, depending on whether they are my friend, my follower, a subscriber or one of my own agents.

Hitchpost is the layer that makes this safe: identity for agent lines and their owners, a contact and relationship graph, sharing rules per relationship, a public directory, and a human approval gate in front of every commitment. It is not another assistant. It connects the assistants people already use.

**v1 proves the protocol on one job: booking.** Dana's agent books Marcus's barbershop over an open protocol. Nothing is committed without Dana's yes, and Marcus's book never double-books. Barbers are the beachhead ([ADR 0008](../decisions/0008-first-vertical-barbers.md)), not the product. The social layers (agent families, owner profiles, relationship tiers, consultation, paid subscriptions) come after v1, in the order set out in section 7.

## 2. Problem

1. **Agents connect to software, not to each other.** A personal agent that wants to book a haircut has to drive a booking website built for humans, or hand the job back to the person. The business's systems already know the answer, but nothing lets one agent ask another directly across vendors.
2. **Rivals connect agents only inside their own silo.** Fresha runs a public MCP server for ChatGPT and Claude, but checkout stays on Fresha. Google AI Mode books Booksy appointments, but only through Google. Nobody offers one neutral line that any agent can reach ([30 Competitive heuristic evaluation](30-competitive-heuristic-evaluation.md), sources viewed 2026-11-09).
3. **There is no trusted way to find or judge an agent, or its owner.** Even when a business or a person has an agent, nobody can look it up, check whose it is, see what it's for, or see how it has behaved.
4. **Personalized agents hold knowledge nobody else can reach.** Everyone's assistant is learning its owner's workflow. An engineer's Claude and a scientist's Claude become very different. There is no safe, consented way for one agent to consult another within limits the owner chooses.

## 3. Goals

| ID  | Goal                                                                             | Measured by                                                                                                                    |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| G-1 | A person can book a real appointment through their agent with one approval       | Approved bookings that were honored (north star)                                                                               |
| G-2 | A business can put its agent line live quickly without changing its booking tool | Time from signup to first offer sent, measured on pilot businesses: median at most 30 minutes, 90th percentile at most 2 hours |
| G-3 | Agents can only commit a person after an explicit yes                            | Zero bookings without a logged approval (audit check)                                                                          |
| G-4 | People can tell a real, well-behaved agent line from a fake or a bad one         | Share of bookings made with verified listings; report rate                                                                     |
| G-5 | Any A2A agent can take part, from any vendor, not only ours                      | At least one third-party agent completing a booking by Phase 6                                                                 |

Goals for the social layers (agent families, relationship tiers, consultation) are written when those stages are designed, after v1.

## 4. Non-goals

- **Inventing a protocol.** Agents talk over A2A; tools over MCP ([ADR 0003](../decisions/0003-build-on-a2a-and-mcp.md)).
- **Building another assistant.** People keep their own Claude, ChatGPT, Gemini or booking AI. Hitchpost is the identity, relationship, policy and directory layer between them.
- **Replacing booking platforms.** Hitchpost sits in front of a business's existing booking tool and reads and writes through it.
- **Payments and deposits in v1.** They bring card-data and consumer-protection rules. Paid subscriptions come in a later stage (L4).
- **Autonomous commitments without approval.** Not a default, ever ([ADR 0007](../decisions/0007-human-approval-gate.md)). Consultation answers are information, never commitments.
- **Free-form chat between language models deciding what gets booked.** Agents exchange typed messages; a language model may turn a person's words into a request, but never decides what gets booked ([ADR 0010](../decisions/0010-typed-data-parts-before-llm.md)).
- **"AI" marketing before there is a model.** Phases 1 to 3 are rule-based agents and are described that way (FTC Act section 5, see [12 Security and privacy](12-security-and-privacy.md)).

## 5. Product principles

1. **The approval gate is the trust floor, not the moat.** Other agent products also ask before acting. What I add is a gate that sits between _two parties'_ agents and is logged for both sides.
2. **The moat is the neutral network.** A cross-vendor, cross-platform directory of agent lines, verified identity, a relationship graph, and reputation from interactions that really happened. Rivals stop at their own silo ([30](30-competitive-heuristic-evaluation.md) section 7.2).
3. **Other agents are strangers until a relationship says otherwise.** Every inbound message is untrusted data, validated and rebuilt before use. Nothing is acted on from free text.
4. **Share the minimum, scoped by relationship.** My agent shares a free slot, not my calendar. Later, what an agent reveals about its owner depends on the caller's tier and the owner's sharing settings, and the owner can see who asked what.
5. **Open by default.** MIT code, open protocol, portable listings ([ADR 0004](../decisions/0004-mit-open-source.md)).
6. **Prove it narrow before going wide.** One job (booking), one vertical (barbers), one neighbourhood, real bookings, before any social layer.

## 6. Success metrics

### North star (v1)

**Weekly human-approved bookings that were honored**: bookings approved by the person that reached the outcome Completed under the outcome resolution rule (FR-RATE-04, FR-RATE-05, P-25). The business marks Completed or NoShow; the customer answers "Did it go as booked?"; a disagreement becomes Disputed and goes to operator review; a booking still unmarked after 7 days becomes Unresolved. Only Completed counts. NoShow, Cancelled, Disputed and Unresolved never count. Outcomes are not billed (P-26), so nobody gains by marking them one way or the other.

### Counter-metrics (must not get worse while the north star grows)

| Metric                                                                  | Why it matters                                    | Phase |
| ----------------------------------------------------------------------- | ------------------------------------------------- | ----- |
| First-offer rejection rate (declined, expired or no reply, over offers) | High means offers don't fit what people asked for | 2     |
| Median time to approve                                                  | Long means the approval step is a chore           | 2     |
| Booking errors (double-booked, cancelled by business, wrong time)       | Directly breaks trust on both sides               | 2     |
| Unmarked rate (bookings that end Unresolved)                            | Outcome data the north star can't trust           | 2     |
| Reports per 100 interactions                                            | Abuse and fake listings                           | 5     |
| Repeat use per person within 60 days                                    | One-off novelty vs a real habit                   | 4     |

### Baseline to measure before Phase 2 ships

Time-to-book today, by phone, website or the app the person already uses, measured on the A-01 participants at enrolment. The owner is excluded from the baseline. Without it, "faster booking" is not a claim I can make. It's assumption A-04 in the [business case](03-business-case.md).

### Later-stage signals (defined when those stages are designed)

Active relationships per agent line, consultations answered within scope, and paid subscriptions retained month to month.

## 7. Scope by phase

The booking phases 0 to 6 prove the protocol, the approval gate and the directory. The social network is then built in stages L1 to L4, in that order, each designed in its own round once v1 is out. Agent authentication moves to whichever stage first introduces relationships, because relationships need authenticated callers.

| Phase            | In scope                                                                                                                                                                                                                            | Out of scope                                              | Status                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------- |
| 0. Foundation    | Repo, MIT license, CI, review bot config, decision log                                                                                                                                                                              | Hosting                                                   | Built locally; first push pending      |
| 1. Agent line    | Barber agent with Agent Card and in-memory book; my agent asks and validates offers; strict validation; card origin pinned                                                                                                          | Booking, approvals, real calendars                        | Built ([`packages/`](../../packages/)) |
| 2. Approval gate | Stored offers with expiry, booking request bound to an offer, human yes or no, standing approval for businesses, customer contact block, booking written, audit log on both sides, decline, cancel and reschedule, conformance kit  | Directory, app UI, payments, manual shop approval (Later) | Phase 2                                |
| 3. Directory     | Business registration, origin verification, search by name, area and service, listing edit                                                                                                                                          | Ratings, paid placement, signed Agent Cards (Phase 6)     | Phase 3                                |
| 4. Client app    | WhatsApp-style app (PWA); built-in personal agent as the consumer agent at launch; contacts are agent lines, people or businesses; person-to-person scheduling (UC-11); reminders; business cancellation notice; approve in the app | Third-party consumer agents as a requirement              | Phase 4                                |
| 5. Ratings       | Two-sided reviews only from verified interactions; behavior signals (answered, honored, stayed in scope); reporting and manual takedown                                                                                             | Auto-suspend, review moderation at scale                  | Phase 5                                |
| 6. Production    | Hosting, signed Agent Cards and auth between agents, per-identity rate limits, monitoring, backups, one real booking system over MCP, business time zones, 5 to 10 real businesses in one Texas neighbourhood                       | Multiple cities, payments                                 | Phase 6                                |
| L1               | Identity and agent family: an owner links all their agent lines (for example their Claude, ChatGPT and Gemini) under one verified identity; family members trust each other at the owner tier                                       | Relationships with other owners                           | Later                                  |
| L2               | Owner and agent profiles (what the agent is used for, skills offered, availability, verification); public directory of public agents; relationship tiers (friend, follower, public, blocked) with sharing scopes per tier           | Paid tiers                                                | Later                                  |
| L3               | MCP gateway so people's own assistants can find agents, view profiles, request access, message agents and approve; consultation between agents within scope; owner activity log                                                     | Paid consults                                             | Later                                  |
| L4               | Paid subscriptions to consult a person's or business's agent, with a platform fee (P-30); payments through a payments provider                                                                                                      |                                                           | Later                                  |
| Later (other)    | Manual shop approval and auto-accept rules, language-model front end, more verticals, deposits, federation of directories, EU expansion                                                                                             |                                                           | Later                                  |

## 8. v1 release criteria (end of Phase 6)

v1 ships only when all of these hold. The test-based evidence for each is the release exit criteria in [15 §11](15-test-strategy.md#11-release-exit-criteria); criterion 2 is measured in the pilot over the window P-21.

1. **Correctness:** 4 consecutive weeks with zero double-bookings and zero bookings without a logged approval.
2. **Real use:** at least 5 businesses listed and verified in one neighbourhood (pilot size P-22); at least 50 honored (Completed) bookings in the window P-21; at least 30% of people who booked once have booked again.
3. **Security:** no open high or critical findings from a fresh audit and a human pentest; signed agent cards, agent-to-agent auth and per-identity rate limits on; dependency audit clean in CI.
4. **Operations:** monitoring and alerts on the booking path; a restore from backup tested; an incident runbook used at least once in a drill; a named backup operator.
5. **Privacy and legal:** published privacy notice, terms of service and business terms ([35 Legal, compliance and governance pack](35-legal-compliance-and-governance.md)); data retention enforced in code; a person can export and delete their data.
6. **Interop:** at least one agent not written by me completes a booking through the directory.

If criterion 2 can't be met after Phase 4, the business case kill criteria apply before more is built.

## 9. Supersedes and related

Supersedes the product sections of [insights.md](../insights.md) and the "pieces" table in [concept.md](../concept.md). Related: [03 business case](03-business-case.md), [04 stakeholders and personas](04-stakeholders-and-personas.md), [05 requirements](05-requirements.md), [30 competitive heuristic evaluation](30-competitive-heuristic-evaluation.md).

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                    | Author      |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0.1     | 2026-11-08 | First draft                                                                                                                                                                                                                                                                                                                                                                                               | S. Jannisar |
| 1.0     | 2026-11-09 | Baselined: renumbered into lifecycle order, formal document control, standards conformance                                                                                                                                                                                                                                                                                                                | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: measurable G-2, north star defined as Completed bookings, signed Agent Cards moved to Phase 6, v1 criteria linked to release exit criteria in 15                                                                                                                                                                                                                    | S. Jannisar |
| 1.3     | 2026-11-09 | Round 3: expert panel audit, user-to-user reframing, US jurisdiction: vision as an agent-to-agent network of agent lines for people and businesses (barbers as beachhead), social stages L1 to L4 after v1, rival silos from doc 30, outcome resolution rule and unmarked-rate counter-metric, baseline excludes the owner, standing approval in the pilot, legal pack and backup operator in v1 criteria | S. Jannisar |
