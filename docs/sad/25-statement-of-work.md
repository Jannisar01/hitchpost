# HP-SAD-25 · Statement of work

| Field       | Value                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-25                                                                                                                 |
| Version     | 1.5                                                                                                                       |
| Status      | Frozen for Phase 2 spike                                                                                                  |
| Date        | 2026-11-09                                                                                                                |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                          |
| Conforms to | PMI PMBOK statement-of-work practice; ISO 21502:2020 project management (scope, deliverables, acceptance, change control) |

## 1. Purpose and scope

This statement of work sets out who does what to take Hitchpost from Phase 1 (Built: the offer exchange only) to the v1 decision (M-08), what each deliverable is, how it is accepted, what it costs and how changes are handled. The work breakdown, estimates and schedule it relies on are in [16 Project plan](16-project-plan.md); where this document quotes a date or a figure, 16 is the source.

## 2. Parties and roles

| Party                                | Role                                                                                                                                                                | Commitment                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Sanaullah Jannisar                   | Owner, product and engineering lead, approver, operator during the pilot                                                                                            | 15 hours a week                          |
| AI engineering partner (Claude Code) | A tool under the owner's direction: writes code and documents to the owner's specification, runs AI-assisted reviews. It holds no decision rights and signs nothing | As directed                              |
| Backup operator                      | Named person who can pause listings and relay cancellations during the pilot                                                                                        | Required before M-07 (go/no-go)          |
| Counsel                              | Reviews the legal pack ([35](35-legal-compliance-and-governance.md)) for Texas and US federal rules                                                                 | One engagement before S1                 |
| External human reviewer              | Independent review of the package and the build                                                                                                                     | At M-05 and M-07                         |
| Contributors                         | Open-source contributions under [CONTRIBUTING.md](../../CONTRIBUTING.md)                                                                                            | Welcome, not planned capacity            |
| Pilot businesses and people          | Use the service and give feedback (P-22)                                                                                                                            | Per pilot agreement and research consent |

## 3. Background

For now Hitchpost is an open protocol: the `hitchpost/1` extension on A2A, an MIT-licensed reference implementation and an MCP gateway, so that anyone's agent can talk to other agents directly ([23 BRD](23-business-requirements-document.md), [24 PRD](24-product-requirements-document.md), [ADR 0020](../decisions/0020-protocol-first.md)). Nobody pays; this is unpaid open-source work with a bounded cash budget. Hitchpost agents are rule-based software until a language model is added (the language-model stage); we don't call them AI before then. Booking with businesses, starting with barbers, is the first proven task and the scope of this statement of work. Phase 1 is Built: two agents exchange typed, validated messages over A2A, with 23 passing tests. Nothing in Phase 2 or later is built yet; the Phase 2 spike comes first.

## 4. Objectives

1. Prove the Phase 2 booking protocol in code against the A2A SDK (the spike) and test the riskiest assumptions (A-01, A-02, A-03, A-05, A-12) before building more ([03](03-business-case.md)).
2. Deliver the booking releases R1 to R5 ([24](24-product-requirements-document.md#7-release-scope-by-phase)) with every phase gate met.
3. Run the pilot in one Texas neighbourhood and reach the v1 decision at M-08 on adoption evidence: independent implementations passing the conformance kit and human-approved bookings, including bookings through the MCP gateway from people's own assistants ([01](01-vision-and-scope.md)).

## 5. Scope of work

| Phase                  | Work                                                                                                                                                                                                                                            | Work packages in [16](16-project-plan.md)                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Discovery              | Disclosed Wizard-of-Oz study (n = 30, 10 weeks, research consent), 10 business interviews about past behaviour, booking-tool API audit, competitor analysis, trust interviews                                                                   | WP-0.1 to WP-0.4                                                                 |
| 2 Approval gate        | Offer store, booking Task, approval type and gate, audit log, cancel and reschedule, customer block, operator-relayed cancel, persistence, conformance kit and extension header, capability tokens, holds cap, book validation, health and logs | WP-2.1 to WP-2.13 (manual approval WP-2.6 moves to Later)                        |
| 3 Directory            | Directory service, verification, search, card origin check, minimal MCP gateway (find an agent line, read its card and profile, ask availability, approve with explicit confirmation)                                                           | WP-3.2 to WP-3.5 and the minimal MCP gateway package in [16](16-project-plan.md) |
| 4 Client app           | UI design and prototype test, app shell and contacts, built-in agent, approval screen, bookings, calendar write, reminders, business cancel notice, person-to-person scheduling, accessibility, dashboard                                       | WP-4.1 to WP-4.7                                                                 |
| 5 Ratings              | Interaction records and metrics, verified-only reviews, reporting and moderation trail                                                                                                                                                          | WP-5.1 to WP-5.3                                                                 |
| 6 Production and pilot | Hosting, agent authentication, rate limits, time zones, real booking connector, observability and backups, privacy and retention, security audit and external review, hosted agents, closed alpha S1, pilot S2, third-party interop             | WP-6.1 to WP-6.12                                                                |

The network stages after v1 (L1 to L4) are out of this statement of work. They get their own statement of work after M-08, at a high level:

| Stage | Outcome                                                                                        | Prerequisite                  |
| ----- | ---------------------------------------------------------------------------------------------- | ----------------------------- |
| L1    | Identity and agent family: one owner, many agent lines across vendors                          | Agent authentication (WP-6.2) |
| L2    | Owner and agent profiles, public directory of agents, relationships and access scopes per tier | L1                            |
| L3    | Full MCP gateway (contacts, relationships) and consultation between agents                     | L2                            |
| L4    | Subscriptions to consult an agent, unpriced and only if adoption warrants it                   | L3, counsel                   |

Tiers, in order: owner (the owner's own agent family), friend (mutual), subscriber (Later, unpriced), follower (one-way), public; `blocked` is an edge state.

## 6. Deliverables and acceptance criteria

| ID    | Deliverable                                         | Acceptance criteria                                                                                                                                                                                                                                                                                              | Due        |
| ----- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| DL-01 | Discovery report (A-01, A-04)                       | Pre-registered bands applied with 95% confidence intervals; continue, iterate or kill decision recorded                                                                                                                                                                                                          | M-01       |
| DL-02 | Business and market report (A-02, A-03, A-05, A-07) | 10 interviews, API audit, connector shortlist, adoption signal; decision recorded                                                                                                                                                                                                                                | M-02       |
| DL-03 | Release R1 (Phase 2)                                | M-03 gate in [16](16-project-plan.md): no booking without a logged approval proven by tests; extension header (TC-51); duplicates and tokens per TC-36 and TC-48; CI green on `main` with branch protection                                                                                                      | M-03       |
| DL-04 | Release R2 (Phase 3)                                | M-04 gate: verified registration, unverified refused, origin check, search; minimal MCP gateway books only with explicit confirmation (FR-GATE-06)                                                                                                                                                               | M-04       |
| DL-05 | Release R3 (Phase 4)                                | M-05 gate: UC-02 end to end in the app, dashboard outcome marking, approval screen shows validated data only, WCAG 2.2 AA audit; external human review done                                                                                                                                                      | M-05       |
| DL-06 | Release R4 (Phase 5)                                | M-06 gate: only verified interactions rated, customer outcome prompt, report and takedown with trail                                                                                                                                                                                                             | M-06       |
| DL-07 | Pilot go-live                                       | M-07: S1 exit criteria and the go/no-go checklist in [17](17-transition-plan.md) met, including the legal pack reviewed by counsel and a named backup operator                                                                                                                                                   | M-07       |
| DL-08 | v1 decision pack                                    | M-08: release criteria in [01](01-vision-and-scope.md) measured (at least 2 independent implementations pass the conformance kit; at least 30 human-approved bookings, at least 10 through the MCP gateway; zero bookings without a logged approval; repeat use over 8 weeks); continue, extend or stop recorded | M-08       |
| DL-09 | Documentation                                       | Each release updates the SA&D package, decision records, bug log and journey; `pnpm docs:check` passes                                                                                                                                                                                                           | Every gate |

## 7. Milestones and schedule

Dates from [16 Project plan](16-project-plan.md) section 6, unchanged here.

| Milestone                            | Date       |
| ------------------------------------ | ---------- |
| M-02 A-02, A-03, A-05, A-07 decision | 2027-01-12 |
| M-01 A-01 and A-04 decision          | 2027-03-02 |
| M-03 Phase 2 gate                    | 2027-04-20 |
| M-04 Phase 3 gate                    | 2027-05-25 |
| M-05 Phase 4 gate                    | 2027-08-31 |
| M-06 Phase 5 gate                    | 2027-09-28 |
| M-07 Pilot go-live                   | 2028-02-01 |
| M-08 v1 decision                     | 2028-05-09 |

M-01 falls after M-02 because the Wizard-of-Oz study (A-01) runs 10 weeks with n = 30. If 16 is re-dated, this table follows it.

## 8. Assumptions

- The owner keeps 15 hours a week; the reserve in 16 covers slips.
- Assumptions A-01 to A-08 in [03](03-business-case.md) hold or are tested on schedule; a kill result stops dependent work.
- A2A v1.0 and the official SDK stay compatible within major version 1.
- At least one booking tool permits programmatic writes (A-03); otherwise the pilot uses the hosted book (connection option C3 in [17](17-transition-plan.md)).

## 9. Dependencies

A2A SDK; a booking tool API; GitHub (repository, CI, branch protection); a hosting provider ([ADR 0014](../decisions/0014-hosting.md)); counsel; the backup operator; pilot businesses and research participants.

## 10. Out of scope

Prices, fees, deposits and payments of any kind (protocol first; monetization Later and undecided); replacing booking tools; markets outside the United States; any language model in the commit path; the network stages L1 to L4 (section 5); 24-hour operations support (P-28 limits SEV1 cover to listed opening hours).

## 11. Responsibilities (RACI)

| Activity                       | Owner | AI partner | Backup operator | Counsel | External reviewer |
| ------------------------------ | ----- | ---------- | --------------- | ------- | ----------------- |
| Product and scope decisions    | A, R  | C          | I               | C       | I                 |
| Design and code                | A     | R          |                 |         | C                 |
| Test and phase-gate audit      | A, R  | R          |                 |         | C                 |
| Legal pack                     | A     | C          |                 | R       |                   |
| Pilot operations and incidents | A, R  |            | R               |         |                   |
| Moderation                     | A, R  |            | R               | C       |                   |
| Acceptance of deliverables     | A     |            |                 |         | C                 |

R responsible, A accountable, C consulted, I informed.

## 12. Acceptance process

1. The deliverable's acceptance criteria (section 6) and the gate in [16](16-project-plan.md) are checked; the evidence is CI results, test reports and the gate audit.
2. For DL-05 and DL-07 the external human reviewer reviews before acceptance.
3. The owner records acceptance in the journey and tags the repository. Rejection lists the failed criteria; rework follows change control if scope changes.

## 13. Change control

All changes use the `docs-change` process in [00 Document control](00-document-control.md). A change to scope, a milestone or a P-ID updates the source document first (16 for schedule and cost, 00 for parameters) and this statement of work follows. A change that moves M-07 or M-08 by more than 4 weeks, or the cash total by more than 20%, needs a written decision record.

## 14. Governance and reporting

| Cadence                  | What                                                           | Audience                                  |
| ------------------------ | -------------------------------------------------------------- | ----------------------------------------- |
| Weekly                   | Progress against work packages, hours used, risks changed      | Owner (journal in the journey)            |
| Per phase gate           | Gate audit, AI-assisted reviews, decisions recorded, `sad` tag | Owner, external reviewer at M-05 and M-07 |
| Monthly during the pilot | Pilot metrics, incidents, support load                         | Owner, backup operator, pilot businesses  |

## 15. Effort and cost

From [16 Project plan](16-project-plan.md) section 5 and section 7.2:

| Measure                                | Value       |
| -------------------------------------- | ----------- |
| Expected effort (PERT)                 | 856.3 hours |
| P95 effort                             | 892 hours   |
| With 20% management reserve            | 1,028 hours |
| Cash subtotal                          | $12,825     |
| Cash total to v1, with 20% contingency | $15,390     |

These are estimates, November 2026 to May 2028. The subtotal already includes the legal pack review ($6,500, the midpoint of a $5,000 to $8,000 range), research incentives ($1,150 including 30 Wizard-of-Oz participants), two human external reviews ($1,000) and a human penetration test ($1,500). Line items are in 16 section 7.2; this statement of work doesn't restate them so it can't drift from them.

## 16. Risks

The risk register is in [03 Business case](03-business-case.md) and the consolidated RAID log in [33](33-raid-log.md). The risks that most affect this statement of work: R-01 (people don't adopt), R-02 (platforms keep agents in their silos, now an issue), R-03 (booking tools block automation), R-11 (solo bandwidth), R-12 (cold start), R-25 (adoption of an unpaid protocol) and R-26 (sustaining a solo open-source project).

## 17. Sign-off

| Role                    | Name               | Decision             | Date       |
| ----------------------- | ------------------ | -------------------- | ---------- |
| Owner and approver      | Sanaullah Jannisar | Approved for Phase 2 | 2026-11-09 |
| External human reviewer | To be named        | Pending, at M-05     |            |
| Counsel                 | To be engaged      | Pending, before S1   |            |

The owner approves their own statement of work; that limit is stated in [00](00-document-control.md) and offset by the external review at M-05 and M-07.

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                   | Author      |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline, rounds 3 and 4: booking releases to v1 in scope, network releases N1 to N6 named as later work, legal and research re-costed                                                                                                                                                                                             | S. Jannisar |
| 1.4     | 2026-11-09 | Reconciled to the project plan (16 v1.3): milestone dates and budget to v1; economics re-timed                                                                                                                                                                                                                                           | S. Jannisar |
| 1.5     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike. No price question in discovery; minimal MCP gateway in Phase 3 scope and the M-04 gate; v1 decision on adoption criteria; N1 to N6 replaced by stages L1 to L4 with the one tier list; spike named as the first objective | S. Jannisar |
