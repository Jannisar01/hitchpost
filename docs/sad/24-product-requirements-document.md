# HP-SAD-24 · Product requirements document

| Field       | Value                                                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document ID | HP-SAD-24                                                                                                                                                                                                                            |
| Version     | 1.1                                                                                                                                                                                                                                  |
| Status      | Frozen for Phase 2 spike                                                                                                                                                                                                             |
| Date        | 2026-11-09                                                                                                                                                                                                                           |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                                                                                                                                     |
| Conforms to | ISO/IEC/IEEE 29148:2018 (stakeholder and software requirements content); common PRD practice (problem, users, scope, prioritised backlog, acceptance criteria, metrics); MoSCoW prioritisation (DSDM); FURPS+ classification (Grady) |

## 1. Purpose and scope

This is the product view of Hitchpost: who it is for, what it must do in each release, in what priority, and how we'll know it works. Business requirements come from [23 BRD](23-business-requirements-document.md); the formal requirement statements stay in [05 Requirements](05-requirements.md), and every user story here traces to them. Values are P-IDs from [00](00-document-control.md#10-normative-parameters-and-phase-map).

**One source for priority.** The MoSCoW column in [05](05-requirements.md) is the source of truth for every FR and NFR. The capability table in section 8 groups requirements and takes the priority of the requirements it groups; it never overrides 05.

## 2. Problem

Agents can't reach each other across vendors. A person's own AI assistant (Claude, ChatGPT, Gemini) can't ask their barber's booking agent for a slot; a friend's agent can't agree a time with theirs; nobody can safely ask an expert's personalised assistant how that expert works. People fall back on calls, texts and forms, and the knowledge inside personalised assistants stays locked away.

## 3. Vision

Let your agent talk to other agents directly. For now Hitchpost is an open protocol: the `hitchpost/1` extension on A2A, an MIT-licensed reference implementation, and an MCP gateway, so that anyone's agent can reach any other agent line, whatever the vendor, under rules the owners set ([ADR 0020](../decisions/0020-protocol-first.md)). Nobody pays; monetization is Later and undecided. Every commitment still needs its owner's explicit yes.

Hitchpost agents are rule-based software until a language model is added (the language-model stage); we don't call them AI before then. People's own assistants are AI; Hitchpost's agents are not, yet.

Booking with businesses, starting with barbers, is the first proven task and the release scope up to v1 (M-08). The minimal MCP gateway (Phase 3) is how people's own assistants reach business agent lines in v1. The agent-to-agent social network follows in stages L1 to L4 after v1. Relationship tiers, in this order: owner (the owner's own agent family), friend (mutual), subscriber (Later, unpriced), follower (one-way), public. `blocked` is an edge state, not a tier.

Positioning per audience:

| Audience                                | Line                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| People with AI assistants               | "Let your agent talk to other agents directly. You just say yes."                       |
| Agent developers                        | "An open A2A extension, JSON Schemas and a conformance kit. Your agent joins in a day." |
| Businesses                              | "A free agent line that answers every agent while you work."                            |
| Experts whose agents are consulted (L3) | "Let people's agents consult yours, on your terms."                                     |

## 4. Personas

The core personas are defined in [04 Stakeholders and personas](04-stakeholders-and-personas.md). This document adds two for the network stages.

| Persona            | Role                                                                                                      | Goal                                                                                                                         | Pain today                                                                                       | Release          |
| ------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| Dana               | Person with an AI assistant                                                                               | Book and schedule with one approval, from the assistant she already uses or the Hitchpost app                                | Phone tag, one app per business                                                                  | Booking releases |
| Marcus             | Business owner (barber)                                                                                   | Take bookings while working, know who is coming                                                                              | Missed calls, anonymous no-shows                                                                 | Booking releases |
| Priya              | Agent developer                                                                                           | Her agent works with every agent line on the network                                                                         | Every platform has its own API                                                                   | Booking releases |
| Sam                | Operator                                                                                                  | Run moderation and support alone with a backup                                                                               | Load and on-call                                                                                 | Booking releases |
| **Dr. Lena Ortiz** | Expert whose agent is consulted (research scientist; uses Claude for literature triage and lab protocols) | Share how she works with collaborators and followers without answering the same questions herself, keep private work private | Repeated cold emails asking how she runs her lab; no control over what an assistant might reveal | L2 to L3         |
| **Jordan Lee**     | Follower (junior engineer)                                                                                | Learn real workflows from people they admire by asking their agents, at the depth the owner allows                           | Generic advice online; experts unreachable                                                       | L2 to L3         |

## 5. Jobs to be done

| Job                                                        | When                                     | Persona      |
| ---------------------------------------------------------- | ---------------------------------------- | ------------ |
| Get a slot without a call, from my own assistant           | I need a haircut this week               | Dana         |
| Answer every booking request while I work                  | I'm with a customer and the phone rings  | Marcus       |
| Agree a time with a friend without back and forth          | We want to meet this week                | Dana         |
| Make my agent work with every agent line, not one platform | I ship an A2A agent                      | Priya        |
| Let others learn how I work without losing control         | People keep asking about my process      | Lena         |
| Learn how an expert actually does it                       | I'm stuck on how to structure my work    | Jordan       |
| Keep my several assistants in one identity                 | I use Claude at work and ChatGPT at home | Lena, Jordan |

## 6. Product principles

1. **Nothing commits a person without their yes.** A tool call or a consultation never commits; booking, sharing beyond scope and anything with money go through the approval gate, including through the MCP gateway (FR-GATE-06).
2. **Vendor-neutral.** Any A2A agent and any MCP-capable assistant can take part.
3. **The owner decides who may ask what.** Sharing is per relationship tier and visible in an activity log (L2).
4. **Sit in front of existing tools, don't replace them.** Businesses keep their booking tool.
5. **Earliest fitting slot, never a business-preferred one** (evidence EV-3 in [31](31-research-evidence-base.md)).
6. **Protocol first, nobody pays.** No prices, fees or billable outcomes in any release up to v1; monetization is Later and undecided ([ADR 0020](../decisions/0020-protocol-first.md)).
7. **Plain disclosure.** Hitchpost agents are rule-based software until a language model is added (the language-model stage); we don't call them AI before then.

## 7. Release scope by phase

| Release | Phase or stage | Scope                                                                                                                                                                                                                       | Status                          |
| ------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| R0      | 1              | Typed availability request and offer over A2A, strict validation, origin pinning                                                                                                                                            | Built (23 tests)                |
| R1      | 2              | Approval gate, booking as a Task, cancel, reschedule, customer block, operator-relayed business cancel, audit log, SQLite persistence, conformance kit, health and logs, hold caps per sender and per business (P-07, P-31) | Next: the spike proves it first |
| R2      | 3              | Directory, verification, search, **minimal MCP gateway** (find an agent line, read its card and profile, ask availability, approve with explicit confirmation)                                                              | Planned                         |
| R3      | 4              | Client app (PWA) with agent contacts, built-in personal agent, person-to-person scheduling (UC-11), reminders (P-29), business cancel notice, dashboard with outcome marking                                                | Planned                         |
| R4      | 5              | Ratings from verified interactions, basic moderation                                                                                                                                                                        | Planned                         |
| R5      | 6              | Production hardening, agent authentication, time zones, one real booking connector, pilot (v1 at M-08)                                                                                                                      | Planned                         |
| L1      | After v1       | Identity and agent family                                                                                                                                                                                                   | Later                           |
| L2      | After L1       | Owner and agent profiles, public directory of agents, relationships and access scopes                                                                                                                                       | Later                           |
| L3      | After L2       | Full MCP gateway (relationships, contacts), consultation                                                                                                                                                                    | Later                           |
| L4      | After L3       | Paid subscriptions, unpriced, only if adoption warrants it                                                                                                                                                                  | Later                           |

Moving the network forward keeps one dependency: relationships need authenticated callers, so agent authentication (R5) must be in place before L2.

## 8. MoSCoW by capability (this release = v1, M-08)

Each row takes the priority its requirements carry in [05](05-requirements.md).

| Capability                                                                     | MoSCoW             | Requirements (05)                  | Reason                                                                          |
| ------------------------------------------------------------------------------ | ------------------ | ---------------------------------- | ------------------------------------------------------------------------------- |
| Approval gate with logged, offer-bound approvals                               | Must               | FR-GATE-01 to FR-GATE-04           | The core promise (G-3)                                                          |
| Booking as an A2A Task with idempotent retries                                 | Must               | FR-MSG-10, FR-BOOK-02, FR-BOOK-07  | Safe commitments across unreliable networks                                     |
| Cancel and reschedule with bookingToken and cutoff                             | Must               | FR-BOOK-03, FR-BOOK-10, FR-BOOK-11 | Table stakes against every rival ([30](30-competitive-heuristic-evaluation.md)) |
| Customer contact block to the business                                         | Must               | FR-BOOK-14                         | Businesses won't accept anonymous bookings (panel finding)                      |
| Offer card shows legal name, total price with tax statement, terms, local time | Must               | FR-BOOK-17, FR-APP-02, FR-APP-11   | Informed consent; consumer rules                                                |
| Standing approval for businesses                                               | Must               | FR-GATE-05 (standing)              | Only pilot mode; booking in seconds                                             |
| Manual business approval                                                       | Won't this release | FR-GATE-05 (manual)                | Adds a 30-minute wait and protocol complexity; designed, Later                  |
| Hold caps per sender and per business                                          | Must               | FR-BOOK-09, FR-BOOK-18             | Install keys can be rotated, so a per-business cap is needed (P-31)             |
| Open extension, JSON Schemas, conformance kit                                  | Must               | FR-MSG-09, FR-MSG-15, NFR-INT-01   | G-5; independent implementations are a release criterion                        |
| Directory with verification and search                                         | Must               | FR-DIR-01 to FR-DIR-04             | G-4; finding agents                                                             |
| Minimal MCP gateway                                                            | Must               | FR-DIR-07, FR-MSG-19, FR-GATE-06   | The v1 demand channel: people's own assistants reach business agent lines       |
| Client app with agent contacts and built-in agent                              | Must               | FR-APP-01, FR-APP-03               | Not everyone runs an MCP-capable assistant (A-08)                               |
| Person-to-person scheduling (UC-11)                                            | Must               | FR-APP-07                          | Proves the network is not just barbers                                          |
| Reminders (P-29)                                                               | Must               | FR-APP-08                          | Best-supported lever for honoured bookings (EV-1)                               |
| Repeat booking ("same as last time")                                           | Should             | FR-APP-09                          | Convenience; not needed to prove the protocol                                   |
| Block a contact                                                                | Should             | FR-APP-05                          | Abuse control; moderation covers the pilot                                      |
| Business cancel notice in the app                                              | Must               | FR-BOOK-15                         | Otherwise people arrive at a closed shop                                        |
| Dashboard with outcome marking                                                 | Must               | FR-RATE-04, FR-RATE-06             | Feeds the north star                                                            |
| Ratings from verified interactions                                             | Must               | FR-RATE-01, FR-RATE-05             | G-4; ratings only from real, logged interactions                                |
| Agent behaviour metrics                                                        | Should             | FR-RATE-02                         | Useful signal; the pilot can run without it                                     |
| Optional human review text                                                     | Could              | FR-RATE-03                         | Moderation load for a solo owner                                                |
| Verification and rating shown on listings                                      | Should             | FR-DIR-05                          | Trust signal; verification alone is enough for the pilot                        |
| Lookalike listing names held for review                                        | Should             | FR-DIR-06                          | Impersonation is rare at pilot size                                             |
| Basic moderation (report, takedown, trail)                                     | Must               | FR-ADMIN-01, FR-ADMIN-02           | Needed before any public listing                                                |
| One real booking connector over MCP                                            | Must               | FR-BOOK-06                         | BR-REQ-03                                                                       |
| Time zones per business                                                        | Must               | FR-BOOK-05                         | No real booking without local time (ADR 0018)                                   |
| Agent authentication                                                           | Must               | NFR-SEC-02                         | Needed before any public listing and before L2                                  |
| Client performance budgets                                                     | Should             | NFR-PERF-03                        | Pilot is small; budgets matter at scale                                         |
| Two or three slots per offer card                                              | Could              | (none yet)                         | Reduces decline-and-ask loops; test in usability rounds                         |
| Track record and auto-accept rules for businesses                              | Could              | (none yet)                         | Useful, not needed for the pilot                                                |
| Prices, fees, deposits, payments                                               | Won't this release | (none)                             | Protocol first; nobody pays ([ADR 0020](../decisions/0020-protocol-first.md))   |
| Identity and agent family                                                      | Won't this release | (L1)                               | Foundation of the network; after v1                                             |
| Owner and agent profiles, public directory of agents                           | Won't this release | (L2)                               | Needs identity first                                                            |
| Relationships and access scopes                                                | Won't this release | (L2)                               | Needs authenticated callers                                                     |
| Full MCP gateway (relationships, contacts)                                     | Won't this release | (L3)                               | Builds on the minimal gateway and L2 policy                                     |
| Consultation                                                                   | Won't this release | (L3)                               | Depends on L2 policy enforcement                                                |
| Paid subscriptions                                                             | Won't this release | (L4)                               | Unpriced; only if adoption warrants it                                          |

## 9. FURPS+ classification

Every requirement in [05](05-requirements.md) has one primary category.

| Category                     | Requirements                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F**unctionality            | FR-MSG-01, FR-MSG-02, FR-MSG-04, FR-MSG-08, FR-MSG-10, FR-MSG-14, FR-MSG-19, FR-BOOK-01 to FR-BOOK-04, FR-BOOK-06 to FR-BOOK-11, FR-BOOK-14 to FR-BOOK-16, FR-GATE-01, FR-GATE-02, FR-GATE-05, FR-DIR-01, FR-DIR-02, FR-DIR-04, FR-DIR-07, FR-APP-01, FR-APP-03 to FR-APP-09, FR-RATE-01 to FR-RATE-06, FR-ADMIN-01, FR-ADMIN-02 |
| Functionality: security      | FR-MSG-03, FR-MSG-12, FR-MSG-16, FR-MSG-18, FR-GATE-04, FR-GATE-06, FR-BOOK-18, FR-DIR-03, FR-DIR-06, NFR-SEC-01 to NFR-SEC-07                                                                                                                                                                                                   |
| **U**sability                | FR-APP-02, FR-APP-11, FR-DIR-05, NFR-A11Y-01                                                                                                                                                                                                                                                                                     |
| **R**eliability              | FR-MSG-05, FR-MSG-13, FR-BOOK-12, FR-BOOK-13, FR-APP-10, NFR-REL-01 to NFR-REL-03                                                                                                                                                                                                                                                |
| **P**erformance              | FR-MSG-07, NFR-PERF-01 to NFR-PERF-03                                                                                                                                                                                                                                                                                            |
| **S**upportability           | FR-MSG-11, FR-GATE-03, FR-ADMIN-03, NFR-OBS-01, NFR-MAINT-01, NFR-MAINT-02                                                                                                                                                                                                                                                       |
| + Design constraints         | FR-MSG-06 (strict ISO instants), FR-MSG-17 (stable `serviceId`), FR-BOOK-05 (IANA zone per business)                                                                                                                                                                                                                             |
| + Implementation constraints | TypeScript monorepo and Node 24 ([ADR 0002](../decisions/0002-typescript-monorepo.md)); official A2A SDK                                                                                                                                                                                                                         |
| + Interface constraints      | FR-MSG-09, FR-MSG-15, FR-APP-12, NFR-INT-01                                                                                                                                                                                                                                                                                      |
| + Physical constraints       | None beyond hosting in [18](18-deployment-and-operations.md)                                                                                                                                                                                                                                                                     |
| + Legal constraints          | FR-BOOK-17 (consumer pre-contract information), NFR-PRIV-01 to NFR-PRIV-03; the legal pack in [35](35-legal-compliance-and-governance.md)                                                                                                                                                                                        |

## 10. User story backlog

Stories follow INVEST. Points are relative estimates (Fibonacci) for one developer. Acceptance criteria are Given/When/Then; every Must story has at least one negative criterion (marked **Not**). The matching test cases are in [15](15-test-strategy.md) and [34](34-functional-test-specification.md). Before the language-model stage, people pick a service, a day and a time window from structured pickers; no story assumes free-text understanding.

### Epic E1: Approval gate and booking (R1, Phase 2)

**US-01 · Approve one offer** (Must, 5 pts, FR-GATE-01, FR-GATE-02, FR-GATE-04)
As Dana, I want my agent to book only the exact offer I approved, so that nothing happens without my yes.

- Given a validated offer, when I approve it, then exactly one `booking_request` for that `offerId` is sent.
- **Not:** Given no approval, when any code path tries to send a `booking_request`, then it can't compile or run without an `Approval` value.
- **Not:** Given an approval for offer A, when the agent tries to book offer B, then it is refused.

**US-02 · Book as a Task** (Must, 5 pts, FR-MSG-10, FR-BOOK-02)
As Dana's agent, I want a booking to be an A2A Task, so that I can check its outcome later.

- Given a valid `booking_request`, when the business agent accepts it under standing approval, then the Task completes with `booking_confirmed` and a `bookingToken` within P-05.
- **Not:** Given the slot was taken meanwhile, when the request arrives, then the Task ends `booking_rejected` with reason `slot_taken` and nothing is booked.

**US-03 · Retry safely** (Must, 3 pts, FR-BOOK-07)
As Dana's agent, I want retries never to double book, so that a dropped connection is harmless.

- Given I have the `taskId`, when I retry, then I call `GetTask` and no new booking is made.
- Given I lost the response, when I resend the same `booking_request`, then I get the original result with `duplicateOf` set.
- **Not:** Given two identical `booking_request`s arrive at once, when both are processed, then exactly one booking exists.

**US-04 · Decline an offer** (Must, 2 pts, FR-BOOK-08)
As Dana, I want to say no, so that the slot is freed for others at once.

- Given a held offer, when I decline, then `offer_declined` is sent and the hold is released immediately.
- **Not:** Given the offer already expired, when I decline, then nothing is booked and no error reaches me.

**US-05 · Cancel a booking** (Must, 3 pts, FR-BOOK-03, FR-BOOK-10)
As Dana, I want to cancel through my agent, so that I don't have to call.

- Given a booking and its `bookingToken`, when I cancel before the cutoff (P-10), then the Task completes `cancelled` and the slot is free.
- **Not:** Given the cutoff has passed, when I cancel, then the Task ends REJECTED with `cancel_rejected` reason `cutoff` and nothing changes.
- **Not:** Given a wrong `bookingToken`, when anyone sends `cancel_request`, then it is rejected with reason `unknown_booking`.

**US-06 · Reschedule atomically** (Must, 5 pts, FR-BOOK-11)
As Dana, I want to move my booking, so that I never end up with two or zero bookings.

- Given a booking, when I send `reschedule_request` with its token, then I get an offer carrying `replacesBookingId` or `no_availability`.
- Given I approve the new offer, when it is booked, then the old booking is cancelled in the same transaction.
- **Not:** Given the new booking fails, when the Task ends, then the old booking is still in place.

**US-07 · Business knows who is coming** (Must, 3 pts, FR-BOOK-14, NFR-PRIV-01)
As Marcus, I want each booking to show the customer's name and phone, so that I can reach them.

- Given Dana approved, when the `booking_request` is sent, then it carries her display name, verified phone and optional note.
- **Not:** Given the booking, when anyone other than that business asks, then the customer block is not disclosed.

**US-08 · Operator-relayed business cancel** (Must, 2 pts, FR-BOOK-15; pilot tool)
As Sam, I want a tool to cancel a booking for a business and log that I told the customer, so that nobody arrives at a closed shop during the pilot.

- Given a business asks, when I cancel through the tool, then the booking is cancelled, the customer contact is shown to me and the relay is logged on both sides.
- **Not:** Given someone who isn't the operator, when they open the tool, then it refuses.

**US-09 · Audit both sides** (Must, 3 pts, FR-GATE-03, FR-MSG-11)
As Sam, I want an append-only log on both sides with correlation ids, so that any booking can be traced.

- Given a booking flow, when it ends, then both logs hold the offer, decision, request and result with `contextId`, `taskId`, `offerId` and `messageId`.
- **Not:** Given an existing audit event, when any code path tries to change or delete it, then it is refused.

**US-10 · Persist across restarts** (Must, 5 pts, NFR-REL-02, FR-BOOK-13)
As Marcus, I want bookings to survive a restart, so that nothing is lost.

- Given a confirmed booking, when the agent restarts, then the booking, its Task state and the audit log are intact.
- **Not:** Given a crash between the booking write and the reply, when the agent restarts, then there is no `booking_confirmed` without a stored booking.

**US-11 · Cap holds per sender and per business** (Must, 3 pts, FR-BOOK-09, FR-BOOK-18, NFR-SEC-03)
As Marcus, I want no single sender, and no crowd of rotating senders, to lock my chairs, so that real customers can book.

- Given a sender (install key) with P-07 open holds, when it asks again, then it gets `rejected` reason `hold_cap` and no new hold.
- **Not:** Given P-31 open holds on my business from any senders, when a new sender with a fresh install key asks, then it gets `rejected` reason `hold_cap` and no new hold.

**US-12 · Validate my own book** (Must, 2 pts, FR-BOOK-12)
As Marcus, I want my agent to refuse a broken setup, so that bad config never offers wrong slots.

- **Not:** Given an invalid book (overlapping services, bad hours, bad booking time), when the agent starts, then it refuses to start and says why.

**US-13 · Declare the contract** (Must, 2 pts, FR-MSG-09, FR-MSG-12)
As Priya, I want the contract version in the card and the header, so that my agent knows what to speak.

- Given my client sends the `A2A-Extensions` header, when it calls, then the request is accepted.
- **Not:** Given a client that doesn't send the header, when it calls, then it gets a clear error naming the extension.

**US-14 · Conformance kit** (Must, 5 pts, FR-MSG-15, NFR-INT-01)
As Priya, I want JSON Schemas and a runner I can point at my agent's URL, so that I can prove my agent works.

- Given my agent's URL, when I run the kit, then each message kind is checked and a pass or fail report is printed.
- **Not:** Given an agent that breaks one rule, when I run the kit, then it fails and names the rule.

**US-15 · Health and logs** (Must, 2 pts, NFR-OBS-01, NFR-REL-03)
As Sam, I want `/healthz`, graceful shutdown and JSON logs, so that I can run it.

- Given a running agent, when I call `/healthz`, then it reports ready; when it gets SIGTERM, then in-flight requests finish before it stops.
- **Not:** Given the store is unavailable, when I call `/healthz`, then it reports not ready.

**US-16 · Manual business approval** (Won't this release, 8 pts; the Later manual mode in 05)
As Marcus, I want to approve some bookings by hand. Designed with the Reserved state and polling; deferred to Later.

### Epic E2: Directory and minimal MCP gateway (R2, Phase 3)

**US-20 · Register and verify** (Must, 5 pts, FR-DIR-01)
As Marcus, I want to list my business, so that agents can find me.

- Given I prove control of my card's origin (well-known token or DNS TXT), when I register, then my listing is published.
- **Not:** Given I can't prove control, when I register, then the listing stays unverified and hidden.

**US-21 · Search** (Must, 3 pts, FR-DIR-02)
As Dana's agent, I want to search by name, service and area, so that I can find a business.

- Given seeded listings, when I search by service "fade" and area "Downtown", then matching verified listings return with cursor pagination.
- **Not:** Given an unverified listing that matches, when I search, then it is not returned.

**US-22 · Trust the card's origin** (Must, 3 pts, FR-DIR-03)
As Dana's agent, I want calls to go only to the listing's origin, so that a fake card can't redirect me.

- **Not:** Given a card whose interface URL differs from the listing's origin, when I resolve it, then I refuse it.

**US-23 · Edit or remove my listing** (Must, 2 pts, FR-DIR-04)
As Marcus, I want to change or remove my listing and nobody else's.

- Given my listing, when I edit it, then the change is published.
- **Not:** Given another owner's listing, when I try to change it, then I'm refused.

**US-24 · My assistant finds an agent line** (Must, 3 pts, FR-DIR-07)
As Dana, I want my own assistant (Claude, ChatGPT, Gemini) to find a business agent line and read its card and owner profile through the Hitchpost MCP server, so that I don't need a new app.

- Given the MCP server is connected to my assistant, when it calls the find tool for a service and area, then verified agent lines return with their card and profile.
- **Not:** Given an unverified listing, when the assistant searches, then it is not returned.

**US-25 · My assistant asks for availability** (Must, 3 pts, FR-MSG-19)
As Dana, I want my assistant to ask an agent line for a slot on my behalf and get back a validated offer.

- Given a chosen agent line, when the assistant calls the availability tool with a service, day and time window, then it receives an offer that passed the same validation as the reference personal agent.
- **Not:** Given a reply that fails validation or doesn't match the request, when it arrives, then the assistant gets an error, never an offer.

**US-26 · Approve only with my explicit confirmation** (Must, 3 pts, FR-GATE-06)
As Dana, I want any booking through my assistant to need my explicit confirmation, so that a tool call or a hostile prompt can't book for me.

- Given an offer, when I confirm through the deep link (or the assistant's own confirmation prompt showing the validated offer fields), then exactly one booking is made.
- **Not:** Given the assistant calls the approve tool without my confirmation, when it does, then nothing is booked.

### Epic E3: Client app and person-to-person (R3, Phase 4)

**US-30 · Contacts are agent lines** (Must, 5 pts, FR-APP-01)
As Dana, I want my contacts to be agents of people and businesses, so that I can message them from one place.

- Given a listing or an agent URL, when I add it, then it appears in my contacts.
- **Not:** Given an agent URL whose card fails validation, when I add it, then it is refused with a reason.

**US-39 · Block a contact** (Should, 2 pts, FR-APP-05)
As Dana, I want to block a contact, so that it can't reach me.

**US-31 · Built-in personal agent** (Must, 8 pts, FR-APP-03)
As Dana, I want an agent in the app, so that I can use Hitchpost without my own assistant or server.

- Given I pick a service, a day and a time window, when I ask, then the built-in agent sends an `availability_request` and shows the validated offer.
- **Not:** Given a reply that fails validation, when it arrives, then no offer is shown and I see why.

**US-32 · Clear offer card** (Must, 5 pts, FR-APP-02, FR-APP-10, FR-APP-11, NFR-A11Y-01)
As Dana, I want the offer to show who, what, when in the shop's time, total price, cancellation terms and "held until" time, so that I know exactly what I'm approving.

- Given an offer, when it is shown, then only validated fields appear as plain text, the business's local time comes first and the hold shows an absolute time.
- **Not:** Given the network drops after I approve, when the app reconnects, then it shows "Checking" and never shows "Booked" without a matching `booking_confirmed`.

**US-33 · My bookings** (Must, 5 pts, FR-APP-04)
As Dana, I want to see, cancel and reschedule my bookings.

- Given my bookings, when I open the list, then each shows its state and the business phone.
- **Not:** Given a booking past its cutoff, when I try to cancel, then the app says why and nothing changes.

**US-42 · Same as last time** (Should, 2 pts, FR-APP-09)
As Dana, I want to repeat a past booking in one step.

**US-34 · Calendar write** (Must, 3 pts, FR-APP-06)
As Dana, I want confirmed bookings in my calendar.

- Given a `booking_confirmed` that matches what I approved, when it arrives, then the calendar entry is written.
- **Not:** Given a confirmation that differs from what I approved, when it arrives, then nothing is written and I'm told.

**US-35 · Reminders** (Must, 3 pts, FR-APP-08)
As Dana, I want reminders 24 hours and 2 hours before (P-29), so that I don't forget.

- Given a booking, when P-29 is reached, then the reminder is sent through the app.
- **Not:** Given no recorded SMS consent, when a reminder is due, then no SMS is sent.

**US-36 · Business cancel notice** (Must, 3 pts, FR-BOOK-15)
As Dana, I want to be told at once if the business cancels, so that I don't arrive at a closed shop.

- Given Marcus cancels, when the `booking_cancelled_by_business` notice arrives, then I get a push notification and the booking shows as cancelled.
- **Not:** Given a notice from any agent other than the business that holds the booking, when it arrives, then it is ignored and logged.

**US-37 · Two people agree a time (UC-11)** (Must, 8 pts, FR-APP-07)
As Dana, I want my agent to agree a time with a friend's agent, so that we skip the back and forth.

- Given both of us are contacts, when my agent proposes times, then my friend's agent offers a time from my friend's free times without sharing the calendar.
- **Not:** Given either of us hasn't approved, when the offer exists, then nothing is written to either calendar.

**US-38 · Dashboard and outcomes** (Must, 5 pts, FR-RATE-04, FR-RATE-06)
As Marcus, I want to see today's bookings and mark each Completed or NoShow, so that the record is right.

- Given a past booking, when I mark it, then it waits in AwaitingOutcome for the customer's answer until P-25.
- **Not:** Given my mark and the customer's answer disagree, when both are in, then the booking is Disputed and goes to operator review, not counted in the north star.

### Epic E4: Ratings and moderation (R4, Phase 5)

**US-40 · Rate a verified interaction** (Must, 5 pts, FR-RATE-01, FR-RATE-05)
As Dana, I want to rate only bookings that really happened, so that ratings are honest.

- Given a verified interaction, when I answer "Did it go as booked?" and rate, then the rating counts.
- **Not:** Given an interaction that isn't verified, when anyone tries to rate it, then the rating is refused.

Behaviour metrics (FR-RATE-02, Should) and optional review text (FR-RATE-03, Could) follow in the same epic when time allows.

**US-41 · Report and takedown** (Must, 5 pts, FR-ADMIN-01, FR-ADMIN-02)
As Sam, I want reports, manual takedown with a statement of reasons and an appeal, and a moderation trail.

- Given a report, when I take a listing down, then the owner gets a statement of reasons and an appeal route, and the action is in the trail.
- **Not:** Given someone who isn't the operator, when they try to take a listing down, then they're refused.

### Epic E5: Production (R5, Phase 6)

**US-45 · Real booking connector** (Must, 8 pts, FR-BOOK-06)
As Marcus, I want my agent to read and write my real booking tool over MCP, so that I keep one calendar.

- Given a supported booking tool, when a booking is confirmed, then it appears in the tool through a conditional write.
- **Not:** Given the slot was taken in the tool meanwhile, when the conditional write runs, then it fails and the Task ends `slot_taken`.

**US-46 · Time zones per business** (Must, 5 pts, FR-BOOK-05)
As Marcus, I want my opening hours in my own time zone, so that offers are at the right local time.

- Given hours in America/Chicago, when an offer is made, then its UTC instant matches the local slot.
- **Not:** Given a local time skipped by a daylight-saving change, when slots are generated, then no slot is offered at that time.

**US-47 · Agent authentication** (Must, 8 pts, NFR-SEC-02)
As Marcus, I want to know which agent is calling, so that limits and trust attach to a real identity.

- Given a signed agent card and a valid credential, when an agent calls, then it is identified.
- **Not:** Given an invalid or revoked credential, when an agent calls, then the call is refused.

### Network stages (after v1, epic level)

| Stage | Epic                            | Story                                                                                                                                       | MoSCoW             | Acceptance at epic level                                                                                                                                                                                                                   |
| ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| L1    | Identity and agent family       | US-50: As Lena, I want to link my Claude, ChatGPT and hosted agent lines into one family, so that they trust each other at the owner tier   | Won't this release | Each linked line proves control (signed card or OAuth to the vendor); family members see the owner tier; unlinking revokes at once                                                                                                         |
| L2    | Profiles and directory          | US-51: As Jordan, I want to see who owns an agent and what it's mostly used for, so that I ask the right one                                | Won't this release | Owner and agent profiles with domains, workflows, skills, languages and verification; public businesses and public agents searchable together                                                                                              |
| L2    | Relationships and access scopes | US-52: As Lena, I want to set what my agent family, friends, subscribers, followers and the public may ask my agent, and see who asked what | Won't this release | Friend, follow and scope requests with approve, decline and auto-rules; the card a caller sees is filtered by tier (extended card for authenticated callers); activity log per owner; blocking works at once; rate limits per relationship |
| L3    | Full MCP gateway                | US-53: As Jordan, I want my own assistant to manage contacts, request access and message agent lines, without a new app                     | Won't this release | Builds on the minimal gateway (US-24 to US-26) with contact and relationship tools; commitments still need the gate                                                                                                                        |
| L3    | Consultation                    | US-54: As Jordan, I want to ask Lena's agent how she structures literature reviews, within what she shares with followers                   | Won't this release | Answers stay within the granted scope; answers are information, never commitments; the owner sees every question                                                                                                                           |
| L4    | Paid subscriptions              | US-55: As Lena, I want people to subscribe to deeper consultation with my agent, with fair cancellation and refunds                         | Won't this release | Unpriced; only if adoption warrants it; payee KYC and the FTC negative-option rule ("click to cancel") apply if it is ever built                                                                                                           |

## 11. Success metrics and analytics events

The north star and counter-metrics are defined in [01](01-vision-and-scope.md): weekly agent-to-agent tasks completed with a human's approval (booking is the first task type). Events, all pseudonymous (salted `personKey`), test bookings excluded:

| Event                                    | Fired when                                | Feeds                                               |
| ---------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| `offer_shown`                            | An offer card renders                     | Time to approve, first-offer rejection              |
| `offer_approved` / `offer_declined`      | The person decides                        | Approval rate, time to approve                      |
| `booking_confirmed` / `booking_rejected` | The Task ends                             | North star, booking errors                          |
| `mcp_tool_called`                        | A person's assistant calls a gateway tool | Gateway adoption (RC: bookings through the gateway) |
| `outcome_marked`                         | Business or customer records an outcome   | Unmarked rate, disputes                             |
| `reminder_sent`                          | A reminder goes out                       | No-show analysis                                    |
| `contact_added` / `contact_blocked`      | Contacts change                           | Network growth, abuse                               |
| `report_filed`                           | A report is made                          | Reports per 100 interactions                        |

Network metrics (defined when L2 starts): accepted relationship requests per owner, consultation questions answered within scope, scope violations (target zero).

## 12. Out of scope

Prices, fees, deposits and payments of any kind (protocol first; monetization Later and undecided); replacing booking tools; ranking or advertising; markets outside the United States before the EU expansion; any language model in the commit path.

## 13. Open questions

| Question                                                                                                                  | Owner            | Decide by |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------- |
| Which booking tool is the first connector (Square looks most realistic per [30](30-competitive-heuristic-evaluation.md))? | Me               | M-02      |
| Which assistants can show a confirmation for an MCP approval, and where is a deep link needed instead (FR-GATE-06)?       | Me               | M-03      |
| How does a vendor assistant prove an agent line belongs to an owner (L1)?                                                 | Me               | Before L1 |
| What knowledge can an agent disclose under each tier without leaking private work (L2)?                                   | Me, with counsel | Before L2 |

## 14. Dependencies

A2A v1.0 and the official SDK; MCP for booking connectors and the gateway; a booking tool with a write API (A-03); counsel for the legal pack ([35](35-legal-compliance-and-governance.md)); agent authentication before L2. No payments provider: nothing is priced.

## 15. Release criteria

v1 release criteria are defined once in [01 Vision and scope](01-vision-and-scope.md) and their exit tests in [15](15-test-strategy.md#11-release-exit-criteria). In short: at least 2 independent implementations (not written by me) pass the conformance kit; at least 30 human-approved bookings complete through agents in the pilot, at least 10 of them through the MCP gateway from people's own assistants; zero bookings without a logged approval; zero open Critical or High security findings; repeat use measured over 8 weeks; the kill check happens at S1. Network stages get their own criteria when L1 is planned.

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Author      |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline, rounds 3 and 4: agent-to-agent social network vision, booking as the first proven use case, MoSCoW, FURPS+, user story backlog US-01 to US-41 and network epics N1 to N6 (US-50 to US-55)                                                                                                                                                                                                                                                                                                      | S. Jannisar |
| 1.1     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike. MoSCoW matches 05 exactly (UC-11, reminders and ratings now Must); negative criteria on every Must story; US-08, US-36 and US-37 traces fixed; new stories US-24 to US-26 (minimal MCP gateway) and US-45 to US-47 (Phase 6 Musts); per-business hold cap (P-31); N1 to N6 replaced by stages L1 to L4; one tier list; structured pickers instead of free text; FURPS+ covers every requirement | S. Jannisar |
