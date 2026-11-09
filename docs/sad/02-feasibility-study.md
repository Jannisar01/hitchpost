# HP-SAD-02 · Feasibility study

| Field       | Value                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-02                                                                                                                                                                          |
| Version     | 1.1                                                                                                                                                                                |
| Status      | Baselined for Phase 2                                                                                                                                                              |
| Date        | 2026-11-09                                                                                                                                                                         |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                                                                                   |
| Conforms to | ISO/IEC/IEEE 15288:2023, Business or mission analysis process (problem definition, solution class alternatives, selection); ISO/IEC/IEEE 29148:2018, business requirements context |

## 1. Purpose and scope

This study asks one question before more is built: should Hitchpost go ahead past Phase 1, and in what form? It covers the system request, how booking works today, feasibility on five axes, the alternatives I considered with a weighted scoring, my recommendation, and the conditions that would reverse it.

It uses the goals (G-), assumptions (A-) and risks (R-) defined in [01 Vision and scope](01-vision-and-scope.md) and [03 Business case](03-business-case.md). Every number marked **estimate** is a planning figure, not a measurement. The measurements that replace them are named next to each one.

## 2. System request summary

| Item                | Content                                                                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sponsor and owner   | Sanaullah Jannisar                                                                                                                                                                              |
| Business need       | Personal agents can't reach local businesses' systems directly. Small service businesses lose bookings to missed calls and app silos. Nobody can look up or judge a business's agent.           |
| Proposed capability | Business agents reachable over A2A, a human approval gate logged on both sides, a public directory with verification, and reputation from verified interactions ([01](01-vision-and-scope.md)). |
| Expected value      | Faster booking for people (A-04), fewer lost bookings for shops (A-02), a neutral directory others can build on (G-5).                                                                          |
| Constraints         | Solo lead with an AI pair; open source (MIT); no payments in v1; one vertical (barbers) and one neighbourhood until the v1 release criteria are met.                                            |
| State today         | Phase 1 built: two agents exchange validated, typed messages over A2A, with 22 passing tests ([journey](../journey/README.md)).                                                                 |

## 3. As-is analysis

### 3.1 How Dana books today

Dana books a haircut every 3 to 4 weeks, usually late in the cycle ([04 Stakeholders and personas](04-stakeholders-and-personas.md)).

| Step                            | Channel                       | Time (estimate)                               | Pain                                                           |
| ------------------------------- | ----------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| Remember she needs a cut        | Herself                       | n/a                                           | Usually remembers when it's already overdue                    |
| Find a free slot                | Shop's booking app or website | 2 to 5 min                                    | One more app and login per shop; slots shown as a grid to scan |
| If no online booking: call      | Phone                         | 1 to 3 min per attempt; often 2 to 3 attempts | Barber can't answer mid-cut; calls go unanswered               |
| Confirm and add to her calendar | By hand                       | 1 min                                         | Easy to forget; no record both sides can check                 |
| **Total time-to-book**          |                               | **4 to 15 min (estimate)**                    | Measured as the A-04 baseline before Phase 2 merges            |

### 3.2 How Marcus takes bookings today

| Step                       | Channel                  | Pain                                                                                                                                 |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Online bookings            | His booking app          | Works, but only for customers who use that app                                                                                       |
| Phone and walk-in requests | Phone, messages, counter | Missed while cutting. I estimate 3 to 6 missed calls a day for a 2-chair shop (**estimate**, replaced by the A-02 interview answers) |
| No-shows                   | None                     | No reliable reminder or confirmation trail outside the app                                                                           |
| Reputation                 | Public review sites      | Reviews say nothing about whether bookings were honored                                                                              |

### 3.3 Quantified pain (estimates, to be replaced by measurement)

| Measure                                          | Estimate                                               | Replaced by                 |
| ------------------------------------------------ | ------------------------------------------------------ | --------------------------- |
| Dana's time-to-book                              | 4 to 15 min                                            | A-04 baseline, 6 people     |
| Marcus's missed calls per day                    | 3 to 6                                                 | A-02 interviews, 10 barbers |
| Share of missed calls that become a lost booking | 20 to 40%                                              | A-02 interviews             |
| Marcus's revenue lost per week at $30 per cut    | 3 to 6 calls × 6 days × 20 to 40% × $30 = $108 to $432 | A-02 interviews             |

The lost-revenue range is wide on purpose. It's the reason A-02 runs before Phase 3, not after.

## 4. Feasibility assessment

Rating: **High** (no known blocker), **Medium** (a known risk with a mitigation), **Low** (a blocker without a mitigation yet).

### 4.1 Technical feasibility: High, with one Medium dependency

| Question                                                                          | Finding                                                                                                                                                                                       | Rating     |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Can two agents find each other and exchange typed messages over an open protocol? | Yes. Built in Phase 1 on the official A2A JS SDK v1.3 (spec v1.0), with end-to-end tests over JSON-RPC.                                                                                       | High       |
| Is A2A mature enough to build on?                                                 | v1.0 spec, a v0.3 compatibility layer, three transports. Breaking changes are possible (R-10). Mitigation: contract tests and a supported-version window ([13 Interfaces](13-interfaces.md)). | High       |
| Can the approval gate be made safe against hostile agents?                        | Partly proven: strict validation and offer matching are built and tested. The gate itself is Phase 2 design ([10 Architecture](10-architecture.md)).                                          | High       |
| Can a business agent read and write the barber's real booking tool?               | Unknown. It depends on each tool's API and terms (A-03, R-03). Fallbacks exist: calendar sync, or a Hitchpost-hosted book.                                                                    | **Medium** |
| Can one person build and run it?                                                  | Within the scope of one neighbourhood, yes. Effort estimate of 697 hours expected, about 836 hours with reserve, discovery included ([16 Project plan](16-project-plan.md)).                  | Medium     |

### 4.2 Economic feasibility: Medium

A 3-year cash view under stated assumptions. Year 1 runs November 2026 to October 2027; Year 2 November 2027 to October 2028; Year 3 November 2028 to October 2029. The v1 decision (M-08) falls in Year 2 ([16 Project plan](16-project-plan.md)).

**Assumptions (all estimates):**

- **Pricing:** the single hypothesis in [03 Business case](03-business-case.md) section 2: $1 per honored booking, capped at $39 per shop per month, first 3 months free for each shop.
- **Volume:** a paying shop gets 25 honored Hitchpost bookings a month in Year 2 and 35 in Year 3, so it pays $25 and then $35 a month (under the cap).
- **Shops, as a scenario, not a forecast:** the pilot neighbourhood (10 shops) goes live in October 2027 and pays from January 2028. If the 12-week expansion rule in 03 section 5 passes, a second neighbourhood (15 shops) starts in May 2028 and pays from August 2028, and a third (15 shops) starts in November 2028 and pays from February 2029. 80% of shops convert to paying after the free months. That gives 116 paying shop-months in Year 2 (10 × 10 + 15 × 3, × 80%) and 348 in Year 3 (25 × 12 + 15 × 9, × 80%). If an expansion step fails its rule, the later rows don't happen.
- No churn modelled. No payments income. Owner time excluded (see below).

|                                                 | Year 1      | Year 2      | Year 3      |
| ----------------------------------------------- | ----------- | ----------- | ----------- |
| AI pair and tools                               | $1,200      | $1,200      | $2,000      |
| Domain                                          | $20         | $20         | $20         |
| Hosting (staging, then production and database) | $250        | $1,500      | $4,800      |
| Research incentives (Wizard-of-Oz, interviews)  | $700        | $0          | $0          |
| Legal review (privacy notice, terms)            | $1,500      | $0          | $0          |
| Moderation and misc.                            | $0          | $300        | $1,000      |
| **Cash cost**                                   | **$3,670**  | **$3,020**  | **$7,820**  |
| **Revenue**                                     | **$0**      | **$2,900**  | **$12,180** |
| **Net**                                         | **−$3,670** | **−$120**   | **+$4,360** |
| **Cumulative**                                  | **−$3,670** | **−$3,790** | **+$570**   |

**Reconciliation with the project budget.** The spend to the v1 decision (November 2026 to January 2028) is Year 1 ($3,670) plus November 2027 to January 2028 from Year 2 ($300 tools, $20 domain, $150 hosting = $470): **$4,140 before contingency, $4,968 with 20% contingency**. That is the same figure as [16 Project plan](16-project-plan.md) section 7.2.

**Net present value** at a 10% discount rate, end-of-year cash flows: −$3,670 / 1.10 − $120 / 1.21 + $4,360 / 1.331 = −$3,336 − $99 + $3,276 = **NPV ≈ −$160** (**estimate**). In cash terms the project roughly breaks even over three years if two expansion steps succeed, and loses about $3,800 if none do.

- **Run-rate break-even:** Year 3 monthly cost is about $650; at $35 per paying shop that's about **19 paying shops**.
- **My time is not in the table.** About 697 hours to v1 at an opportunity cost of $60 an hour is about $42,000 (**estimate**). It isn't recovered in 3 years at this scale; with it included the NPV is strongly negative.

**Conclusion:** the cash risk is small and bounded, under $5,000 before any revenue. The economic case at this scale rests on what I learn, the portfolio value and the option to expand. It does not rest on near-term profit, and the NPV says so plainly. That's acceptable as long as the kill criteria in section 7 are honored.

### 4.3 Operational feasibility: Medium

| Question                                                       | Finding                                                                                                                                                                                           | Rating |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Will barbers act on bookings that arrive this way?             | Unproven (A-02). Standing approval by default means Marcus doesn't have to do anything per booking (FR-GATE-05).                                                                                  | Medium |
| Will people approve offers instead of using an app or calling? | Unproven (A-01). Tested by an 8-week Wizard-of-Oz before Phase 2 build beyond protocol-safe work.                                                                                                 | Medium |
| Can one person handle onboarding, support and moderation?      | Yes, at 5 to 10 shops: under 15 minutes onboarding per shop, support by message during hypercare ([17 Transition plan](17-transition-plan.md)). Not beyond one neighbourhood without help (R-11). | Medium |
| Does it fit how shops already work?                            | Hitchpost sits beside the existing booking tool rather than replacing it, which is a non-goal in [01](01-vision-and-scope.md).                                                                    | High   |

### 4.4 Schedule feasibility: Medium

The expected effort is 697 hours (P80 about 714, P95 about 731) from the three-point estimates, discovery work included, or about 836 hours with a 20% reserve. All of it is done by one person at 15 hours a week (**estimate** of sustainable solo capacity), so discovery and build share the same hours. On that resource-loaded plan the pilot goes live on **2027-10-12** and the v1 decision lands on **2028-01-18**, or as late as **2028-03-21** if the full reserve is used before the pilot ([16 Project plan](16-project-plan.md)). The schedule is sensitive to two things: the booking-system connector (WP-6.5) and how fast barbers can be recruited for the pilot.

### 4.5 Legal and regulatory feasibility: High for v1, Medium later

This section is not legal advice. It lists what has to be checked, and when.

| Area                                                 | Position for v1                                                                                                                                                                                                           | Rating |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Personal data (GDPR / UK GDPR / CCPA)                | Minimal data: name, contact, booking times. Data minimisation (NFR-PRIV-01), retention and deletion (NFR-PRIV-02). A privacy notice is required before the pilot ([12 Security and privacy](12-security-and-privacy.md)). | High   |
| Booking platform terms                               | Automation may be restricted (R-03). Checked in the A-03 desk audit before Phase 3 starts.                                                                                                                                | Medium |
| Payments and card data                               | Out of scope for v1, so no PCI DSS exposure (R-09).                                                                                                                                                                       | High   |
| Consumer protection and liability for wrong bookings | Mitigated by the approval and audit log on both sides, plus clear terms reviewed by a lawyer before the pilot (R-07).                                                                                                     | High   |
| Name and trademark                                   | "Hitchpost" is a working codename ([ADR 0006](../decisions/0006-working-codename.md)). A trademark search is needed before public launch.                                                                                 | Medium |
| Open-source licence                                  | MIT, with dependency licences checked in CI from Phase 6.                                                                                                                                                                 | High   |

## 5. Alternatives analysis

### 5.1 Alternatives

| ID    | Alternative                     | Summary                                                                                                                                                   |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALT-A | Do nothing                      | Stop after Phase 1. Keep the code as a reference.                                                                                                         |
| ALT-B | Plugin for one booking platform | Build an A2A endpoint for one platform's shops only (for example Square Appointments, subject to its API and terms).                                      |
| ALT-C | Own directory on A2A (proposed) | A neutral, cross-platform directory of business agents, with the approval gate, verification and reputation. Connectors to booking tools come in Phase 6. |
| ALT-D | Consumer-only assistant         | A personal agent that drives businesses' existing websites and apps for the person. No business side, no directory.                                       |

### 5.2 Criteria and weights

| Criterion                    | Weight | What a 5 means                                                     |
| ---------------------------- | ------ | ------------------------------------------------------------------ |
| Fit to goals G-1 to G-5      | 25     | Meets all five goals                                               |
| Defensibility                | 20     | Hard to copy, with an asset that compounds (directory, reputation) |
| Time to first value          | 15     | Real bookings within weeks                                         |
| Cost and effort              | 15     | Lowest build and run cost                                          |
| Dependency risk              | 15     | No single outside party can switch it off                          |
| Learning and portfolio value | 10     | Tests the riskiest assumptions; shows end-to-end system design     |

### 5.3 Weighted scoring (scores 1 to 5)

| Criterion (weight)          | ALT-A    | ALT-B    | ALT-C    | ALT-D    |
| --------------------------- | -------- | -------- | -------- | -------- |
| Fit to goals (25)           | 1        | 3        | 5        | 2        |
| Defensibility (20)          | 1        | 2        | 4        | 1        |
| Time to first value (15)    | 1        | 4        | 2        | 4        |
| Cost and effort (15)        | 5        | 4        | 2        | 3        |
| Dependency risk (15)        | 5        | 1        | 3        | 2        |
| Learning and portfolio (10) | 1        | 3        | 5        | 3        |
| **Weighted score (of 5)**   | **2.20** | **2.80** | **3.60** | **2.35** |

Score notes:

- **ALT-B** scores 1 on dependency risk because one platform's API terms decide whether it exists (R-02, R-03). It scores 3 on fit because it fails G-5 (any agent) and G-4 (neutral trust).
- **ALT-D** scores 1 on defensibility because general assistants already drive websites (R-02 and section 1 of [03](03-business-case.md)). Driving human-facing websites is also brittle and may break their terms.
- **ALT-C** scores 2 on time and on cost, because it needs a directory and a business side. That's the price of the only option that meets all five goals.

### 5.4 Sensitivity

ALT-C leads ALT-B by 0.80. The single 10-point weight shift that hurts ALT-C most moves weight from fit to time to first value. Even then ALT-C still leads by 0.40. It would take two such shifts at once, for example fit to time and learning to cost, to bring the two level. I accept that: it only happens if I stop caring about the goals in [01](01-vision-and-scope.md).

## 6. Recommendation

**Proceed with ALT-C**, using ALT-B's integration as the Phase 6 connector for whichever booking tool the A-03 audit favors, not as the product. The work is staged so that the riskiest assumptions are tested before the money and time that depend on them are spent:

| Before                                         | Test                                                                        | Assumptions      |
| ---------------------------------------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 2 build beyond protocol-safe work (M-01) | 8-week Wizard-of-Oz with about 15 people; time-to-book baseline             | A-01, A-04       |
| Phase 3 starts (M-02)                          | 10 barber interviews; booking-tool API desk audit; verified competitor scan | A-02, A-03, A-07 |
| Phase 3 starts (M-02)                          | Defensibility and price check, in the same interviews and scan              | A-05             |
| Phase 4 starts                                 | Whether people care which assistant they use (from the A-01 data)           | A-08             |

## 7. Conditions that would reverse this recommendation

I'd stop or change course if any of these happen. Each maps to a kill criterion in [03 Business case](03-business-case.md) section 3.

| Condition                                                                                                           | Response                                                                                        |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A-01 fails: under 60% complete one booking, under 30% complete two, or under 50% first-offer approval, over 8 weeks | Stop Phase 2 build at M-01. Keep Phase 1 and the protocol-safe work as a reference (ALT-A).     |
| A-02 fails: fewer than 3 of 10 barbers would list for free                                                          | Pivot to another vertical where the business side is more eager, or to ALT-D for learning only. |
| A-03 fails: none of the top 3 tools allows writes                                                                   | Keep ALT-C, with a Hitchpost-hosted book or calendar sync. Re-estimate WP-6.5.                  |
| A-05 or A-07 fails: a platform already offers cross-platform agent booking with reputation                          | Partner with it or contribute to it. Don't build a competing directory.                         |
| Real time per week drops below 8 hours for more than a month                                                        | Re-baseline the schedule in [16 Project plan](16-project-plan.md), or cut Phase 5 to after v1.  |

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                  | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline                                                                                                                                                                                                                                                                                                                                          | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: one pricing hypothesis ($1 per honored booking, $39 cap, 3 months free); 3-year table rebuilt with a stated shop scenario, NPV at 10% and reconciliation to the 16 budget ($4,140, $4,968 with contingency); schedule and effort from the resource-loaded plan; A-01 redesigned to 8 weeks with the new pass rule | S. Jannisar |
