# HP-SAD-01 · Vision and scope

| Field       | Value                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-01                                                                                                               |
| Version     | 1.4                                                                                                                     |
| Status      | Frozen for Phase 2 spike                                                                                                |
| Date        | 2026-11-09                                                                                                              |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                        |
| Conforms to | ISO/IEC/IEEE 29148:2018 (business requirements: mission, goals, scope); ISO/IEC/IEEE 15288 business or mission analysis |

## 1. Vision statement

**Let your agent talk to other agents directly.** Every person and every business gets an **agent line**: an addressable agent, from any vendor, that other agents can find, ask and work with, within limits its owner sets. My Claude should be able to talk to my barber's booking agent and sort out a time for me, whoever built either one. Later, other people's agents should be able to ask my agent how I work, depending on our relationship: owner, friend, subscriber, follower or public.

For now Hitchpost is **an open protocol, not a business**: the `hitchpost/1` extension on A2A, an MIT-licensed reference implementation, and a minimal MCP gateway that lets people's own assistants (Claude, ChatGPT, Gemini) use it. **Nobody pays.** There is no pricing by design; monetization is Later and undecided. Hitchpost adds what neither A2A nor MCP covers: identity for agent lines and their owners, a directory, sharing rules per relationship, and a human approval gate in front of every commitment. It is not another assistant. It connects the assistants people already use.

**v1 proves the protocol on one task type: booking.** Dana's assistant books Marcus's barbershop over the open protocol, either through the minimal MCP gateway from her own assistant or through the built-in app. Nothing is committed without Dana's yes, and Marcus's book never double-books. The first users are **AI power users and agent developers**: they already run assistants, know MCP and can self-serve. Barbers are the first business demonstration ([ADR 0008](../decisions/0008-first-vertical-barbers.md)), reached where possible through agents they already have. The social layers (agent families, owner profiles, relationship tiers, consultation, subscriptions) come after v1, in the stages set out in section 7.

Hitchpost agents are rule-based software until a language model is added (the language-model stage); we don't call them AI before then. People's own assistants are AI; Hitchpost's own agents are not, before that stage.

## 2. Problem

1. **Agents connect to software, not to each other.** A person's assistant that wants to book a haircut has to drive a booking website built for humans, or hand the job back to the person. The business's systems already know the answer, but nothing lets one agent ask another directly across vendors.
2. **Rivals connect agents only inside their own silo.** Fresha runs a public MCP server for ChatGPT and Claude, but checkout stays on Fresha. Google AI Mode books Booksy appointments, but only through Google. Nobody offers one neutral, open line that any agent can reach ([30 Competitive heuristic evaluation](30-competitive-heuristic-evaluation.md), sources viewed 2026-11-09).
3. **There is no trusted way to find or judge an agent, or its owner.** Even when a business or a person has an agent, nobody can look it up, check whose it is, see what it's for, or see how it has behaved.
4. **Personalized agents hold knowledge nobody else can reach.** Everyone's assistant is learning its owner's workflow. An engineer's Claude and a scientist's Claude become very different. There is no safe, consented way for one agent to consult another within limits the owner chooses.

## 3. Goals

| ID  | Goal                                                                                             | Measured by                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| G-1 | A person can complete a real task through their agent with one approval, starting with a booking | Weekly agent-to-agent tasks completed with a human's approval (north star)                                                     |
| G-2 | A business can put its agent line live quickly, for free, without changing its booking tool      | Time from signup to first offer sent, measured on pilot businesses: median at most 30 minutes, 90th percentile at most 2 hours |
| G-3 | Agents can only commit a person after an explicit yes                                            | Zero bookings without a logged approval (audit check)                                                                          |
| G-4 | People can tell a real, well-behaved agent line from a fake or a bad one                         | Share of bookings made with verified listings; report rate                                                                     |
| G-5 | Any agent can take part, from any vendor, not only ours                                          | At least 2 independent implementations not written by me pass the conformance kit by Phase 6                                   |

Goals for the social layers (agent families, relationship tiers, consultation) are written when those stages are designed, after v1.

## 4. Non-goals

- **Charging anyone, for now.** Hitchpost is a free, open protocol and reference implementation. No prices, fees or willingness-to-pay tests are in the plan; monetization is Later and undecided ([03 Adoption case](03-business-case.md)).
- **Inventing a protocol.** Agents talk over A2A; people's assistants and tools connect over MCP ([ADR 0003](../decisions/0003-build-on-a2a-and-mcp.md)).
- **Building another assistant.** People keep their own Claude, ChatGPT, Gemini or booking agent. Hitchpost is the identity, relationship, policy and directory layer between them.
- **Replacing booking platforms.** Hitchpost sits in front of a business's existing booking tool and reads and writes through it.
- **Payments and deposits in v1.** They bring card-data and consumer-protection rules. Subscriptions to consult an agent are stage L4, Later and unpriced.
- **Autonomous commitments without approval.** Not a default, ever ([ADR 0007](../decisions/0007-human-approval-gate.md)). Consultation answers are information, never commitments.
- **Free-form chat between language models deciding what gets booked.** Agents exchange typed messages; a language model may turn a person's words into a request, but never decides what gets booked ([ADR 0010](../decisions/0010-typed-data-parts-before-llm.md)).
- **Calling Hitchpost's own agents AI before there is a model.** The standard wording in section 1 applies everywhere (FTC Act section 5, see [12 Security and privacy](12-security-and-privacy.md)).

## 5. Product principles

1. **The approval gate is the trust floor, not the moat.** Other agent products also ask before acting. What I add is a gate that sits between _two parties'_ agents and is logged for both sides.
2. **The value is the neutral network.** A cross-vendor, cross-platform directory of agent lines, verified identity, a relationship graph, and reputation from interactions that really happened. Rivals stop at their own silo ([30](30-competitive-heuristic-evaluation.md) section 7.2).
3. **Other agents are strangers until a relationship says otherwise.** Every inbound message is untrusted data, validated and rebuilt before use. Nothing is acted on from free text.
4. **Share the minimum, scoped by relationship.** My agent shares a free slot, not my calendar. Later, what an agent reveals about its owner depends on the caller's tier and the owner's sharing settings, and the owner can see who asked what.
5. **Open and free first.** MIT code, an open protocol, portable listings, nobody pays ([ADR 0004](../decisions/0004-mit-open-source.md)). Adoption comes before any business model.
6. **Prove it narrow before going wide.** One task type (booking), one business demonstration (barbers), one neighbourhood, real bookings, before any social layer.

## 6. Success metrics

### North star (v1)

**Weekly agent-to-agent tasks completed with a human's approval.** Booking is the first task type: a booking counts when the person approved it and it reached the outcome Completed under the outcome resolution rule (FR-RATE-04, FR-RATE-05, FR-RATE-06, P-25). After the appointment a booking is AwaitingOutcome until both the business mark and the customer answer are in, or until P-25 passes. Matching answers resolve it; a business mark alone resolves at P-25; a disagreement becomes Disputed and goes to operator review; a customer answer alone at P-25 becomes Unresolved, which is final. Only Completed counts. NoShow, Cancelled, Disputed and Unresolved never count. Nobody pays, so nobody gains by marking outcomes one way or the other.

### Counter-metrics (must not get worse while the north star grows)

| Metric                                                                  | Why it matters                                    | Phase |
| ----------------------------------------------------------------------- | ------------------------------------------------- | ----- |
| First-offer rejection rate (declined, expired or no reply, over offers) | High means offers don't fit what people asked for | 2     |
| Median time to approve                                                  | Long means the approval step is a chore           | 2     |
| Booking errors (double-booked, cancelled by business, wrong time)       | Directly breaks trust on both sides               | 2     |
| Unmarked rate (bookings that end Unresolved)                            | Outcome data the north star can't trust           | 2     |
| Disputes per 100 completed bookings                                     | Disagreement between the two sides                | 4     |
| Reports per 100 interactions                                            | Abuse and fake listings                           | 5     |
| Repeat use per person over the window P-21 (8 weeks)                    | One-off novelty vs a real habit                   | 4     |

### Baseline to measure before Phase 2 ships

Time-to-book today, by phone, website or the app the person already uses, measured on the A-01 participants at enrolment. The owner is excluded from the baseline. Without it, "faster booking" is not a claim I can make. It's assumption A-04 in the [adoption case](03-business-case.md).

### Later-stage signals (defined when those stages are designed)

Active relationships per agent line, consultations answered within scope, and the share of agent lines that link more than one vendor's agent.

## 7. Scope by phase

The booking phases 0 to 6 prove the protocol, the approval gate, the directory and the minimal MCP gateway. The social network is then built in stages L1 to L4, in that order, each designed once the Phase 2 spike's evidence is in ([00 §6.4](00-document-control.md)). Agent authentication moves to whichever stage first introduces relationships, because relationships need authenticated callers. L1 to L4 is the only stage scheme.

| Phase            | In scope                                                                                                                                                                                                                                                        | Out of scope                                              | Status                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------- |
| 0. Foundation    | Repo, MIT license, CI, review bot config, decision log                                                                                                                                                                                                          | Hosting                                                   | Built locally; first push pending      |
| 1. Agent line    | Barber agent with Agent Card and in-memory book; my agent asks and validates offers; strict validation; card origin pinned                                                                                                                                      | Booking, approvals, real calendars                        | Built ([`packages/`](../../packages/)) |
| 2. Approval gate | Stored offers with expiry, booking request bound to an offer, human yes or no, standing approval for businesses, customer contact block, booking written, audit log on both sides, decline, cancel and reschedule, conformance kit                              | Directory, app UI, payments, manual shop approval (Later) | Phase 2                                |
| 3. Directory     | Business registration, origin verification, search by name, area and service, listing edit; **minimal MCP gateway** (find an agent line, read its card and profile, ask availability, approve through an explicit confirmation)                                 | Ratings, signed Agent Cards (Phase 6), full MCP gateway   | Phase 3                                |
| 4. Client app    | WhatsApp-style app (PWA); built-in personal agent for people without an assistant; contacts are agent lines, people or businesses; person-to-person scheduling (UC-11); reminders; business cancellation notice; approve in the app                             | Third-party assistants as the only channel                | Phase 4                                |
| 5. Ratings       | Two-sided reviews only from verified interactions; behavior signals (answered, honored, stayed in scope); reporting and manual takedown                                                                                                                         | Auto-suspend, review moderation at scale                  | Phase 5                                |
| 6. Production    | Hosting, signed Agent Cards and auth between agents, per-identity rate limits, monitoring, backups, one real booking system over MCP, business time zones, 5 to 10 real businesses in one Texas neighbourhood                                                   | Multiple cities, payments                                 | Phase 6                                |
| L1               | Identity and agent family: an owner links all their agent lines (for example their Claude, ChatGPT and Gemini) under one verified identity; family members trust each other at the owner tier                                                                   | Relationships with other owners                           | Later                                  |
| L2               | Owner and agent profiles (what the agent is used for, skills offered, availability, verification); public directory of public agents; relationship tiers (owner, friend, subscriber, follower, public; `blocked` as an edge state) with sharing scopes per tier | Subscriptions                                             | Later                                  |
| L3               | Full MCP gateway: relationships and access requests from people's own assistants; consultation between agents within scope; owner activity log                                                                                                                  | Subscriptions                                             | Later                                  |
| L4               | Subscriptions to consult a person's or business's agent: unpriced, only if adoption warrants it                                                                                                                                                                 | Any pricing decision                                      | Later                                  |
| Later (other)    | Manual shop approval and auto-accept rules, the language-model stage, more verticals, deposits, federation of directories, monetization (undecided), EU expansion                                                                                               |                                                           | Later                                  |

## 8. v1 release criteria (end of Phase 6)

v1 ships only when all of these hold. The test-based evidence for each is the release exit criteria in [15 §11](15-test-strategy.md#11-release-exit-criteria); criterion 2 is measured in the pilot over the window P-21 (8 weeks ending at M-08).

1. **Correctness:** 4 consecutive weeks with zero double-bookings and zero bookings without a logged approval.
2. **Real use:** at least 30 human-approved bookings completed through agents in the pilot, including at least 10 through the minimal MCP gateway from people's own assistants; repeat use measured over the 8-week window P-21. The numbers are re-sized from the A-01 results before S1.
3. **Security:** zero Critical or High findings open from a fresh audit and a human pentest; signed agent cards, agent-to-agent auth and per-identity rate limits on; dependency audit clean in CI.
4. **Operations:** monitoring and alerts on the booking path; a restore from backup tested; an incident runbook used at least once in a drill; a named backup operator.
5. **Privacy and legal:** published privacy notice, terms of service and business terms ([35 Legal, compliance and governance pack](35-legal-compliance-and-governance.md)); data retention enforced in code; a person can export and delete their data.
6. **Interop:** at least 2 independent implementations not written by me pass the conformance kit, and at least one of them completes a booking through the directory.

**Kill check at S1.** If the S1 pilot stage shows criterion 2 can't be reached, the adoption kill criteria in [03](03-business-case.md) apply before more is built. The check happens at S1, not after Phase 4.

## 9. Supersedes and related

Supersedes the product sections of [insights.md](../insights.md) and the "pieces" table in [concept.md](../concept.md). Related: [03 adoption case](03-business-case.md), [04 stakeholders and personas](04-stakeholders-and-personas.md), [05 requirements](05-requirements.md), [30 competitive heuristic evaluation](30-competitive-heuristic-evaluation.md).

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Author      |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0.1     | 2026-11-08 | First draft                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | S. Jannisar |
| 1.0     | 2026-11-09 | Baselined: renumbered into lifecycle order, formal document control, standards conformance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: measurable G-2, north star defined as Completed bookings, signed Agent Cards moved to Phase 6, v1 criteria linked to release exit criteria in 15                                                                                                                                                                                                                                                                                                                                                                                                                                     | S. Jannisar |
| 1.3     | 2026-11-09 | Round 3: expert panel audit, user-to-user reframing, US jurisdiction: vision as an agent-to-agent network of agent lines for people and businesses (barbers as beachhead), social stages L1 to L4 after v1, rival silos from doc 30, outcome resolution rule and unmarked-rate counter-metric, baseline excludes the owner, standing approval in the pilot, legal pack and backup operator in v1 criteria                                                                                                                                                                                                                  | S. Jannisar |
| 1.4     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike: vision "Let your agent talk to other agents directly"; nobody pays; AI power users and agent developers first, barbers the first business demonstration; north star is weekly agent-to-agent tasks completed with approval, with the AwaitingOutcome resolution rule; G-5 is two independent conformant implementations; minimal MCP gateway in Phase 3; one tier list; L4 unpriced; release criteria rewritten (30 bookings, 10 via the MCP gateway, 8-week window, kill check at S1); standard AI wording | S. Jannisar |
