# HP-SAD-02 · Feasibility study

| Field       | Value                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-02                                                                                                                                                                          |
| Version     | 1.4                                                                                                                                                                                |
| Status      | Baselined for Phase 2                                                                                                                                                              |
| Date        | 2026-11-09                                                                                                                                                                         |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                                                                                   |
| Conforms to | ISO/IEC/IEEE 15288:2023, Business or mission analysis process (problem definition, solution class alternatives, selection); ISO/IEC/IEEE 29148:2018, business requirements context |

## 1. Purpose and scope

This study asks one question before more is built: should Hitchpost go ahead past Phase 1, and in what form? It covers the system request, how booking works today, feasibility on five axes, the alternatives I considered with a weighted scoring, my recommendation, and the conditions that would reverse it.

Hitchpost is a network of agent lines between people and businesses ([01 Vision and scope](01-vision-and-scope.md)). This study judges the part that has to work first: booking with businesses, with barbers as the beachhead. The social stages L1 to L4 get their own feasibility check when they're designed.

It uses the goals (G-), assumptions (A-) and risks (R-) defined in [01](01-vision-and-scope.md) and [03 Business case](03-business-case.md). Every number marked **estimate** is a planning figure, not a measurement. The measurements that replace them are named next to each one.

## 2. System request summary

| Item                | Content                                                                                                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sponsor and owner   | Sanaullah Jannisar                                                                                                                                                                                                                                         |
| Business need       | People's agents can't reach each other, or businesses' systems, across vendors. Small service businesses lose bookings to missed calls and app silos. Rivals offer agent access only inside their own platform. Nobody can look up or judge an agent line. |
| Proposed capability | Agent lines for people and businesses, reachable over A2A; a human approval gate logged on both sides; a public directory with verification; reputation from verified interactions; later, relationships and consultation ([01](01-vision-and-scope.md)).  |
| Expected value      | Faster booking for people (A-04), fewer lost bookings for businesses (A-02), a neutral network others can build on (G-5).                                                                                                                                  |
| Constraints         | Solo lead with an AI pair; open source (MIT); no payments in v1; one job (booking), one beachhead (barbers) and one Texas neighbourhood until the v1 release criteria are met.                                                                             |
| State today         | Phase 1 built: two agents exchange validated, typed messages over A2A, with the call origin pinned to the card's origin and 23 passing tests ([journey](../journey/README.md)).                                                                            |

## 3. As-is analysis

### 3.1 How Dana books today

Dana books a haircut every 3 to 4 weeks, usually late in the cycle ([04 Stakeholders and personas](04-stakeholders-and-personas.md)). Her real alternative is the booking app her barber already uses, which rivals make fast (Booksy saves her details; Google AI Mode books in one conversation, see [30](30-competitive-heuristic-evaluation.md)).

| Step                            | Channel                       | Time (estimate)                               | Pain                                                           |
| ------------------------------- | ----------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| Remember she needs a cut        | Herself                       | n/a                                           | Usually remembers when it's already overdue                    |
| Find a free slot                | Shop's booking app or website | 30 s to 5 min                                 | One more app and login per shop; slots shown as a grid to scan |
| If no online booking: call      | Phone                         | 1 to 3 min per attempt; often 2 to 3 attempts | Barber can't answer mid-cut; calls go unanswered               |
| Confirm and add to her calendar | By hand                       | 1 min                                         | Easy to forget; no record both sides can check                 |
| **Total time-to-book**          |                               | **30 s to 15 min (estimate)**                 | Measured as the A-04 baseline at A-01 enrolment                |

### 3.2 How Marcus takes bookings today

| Step                       | Channel                  | Pain                                                                                                                                 |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Online bookings            | His booking app          | Works, but only for customers who use that app                                                                                       |
| Phone and walk-in requests | Phone, messages, counter | Missed while cutting. I estimate 3 to 6 missed calls a day for a 2-chair shop (**estimate**, replaced by the A-02 interview answers) |
| No-shows                   | None                     | No reliable reminder or confirmation trail outside the app                                                                           |
| Reputation                 | Public review sites      | Reviews say nothing about whether bookings were honored                                                                              |

### 3.3 Quantified pain (estimates, to be replaced by measurement)

| Measure                                          | Estimate                                               | Replaced by                                      |
| ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------ |
| Dana's time-to-book                              | 30 s to 15 min                                         | A-04 baseline, A-01 participants, owner excluded |
| Marcus's missed calls per day                    | 3 to 6                                                 | A-02 interviews, 10 barbers                      |
| Share of missed calls that become a lost booking | 20 to 40%                                              | A-02 interviews                                  |
| Marcus's revenue lost per week at $30 per cut    | 3 to 6 calls × 6 days × 20 to 40% × $30 = $108 to $432 | A-02 interviews                                  |

The lost-revenue range is wide on purpose. It's the reason A-02 runs before Phase 3, not after.

## 4. Feasibility assessment

Rating: **High** (no known blocker), **Medium** (a known risk with a mitigation), **Low** (a blocker without a mitigation yet).

### 4.1 Technical feasibility: High, with one Medium dependency

| Question                                                                          | Finding                                                                                                                                                                                              | Rating     |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Can two agents find each other and exchange typed messages over an open protocol? | Yes. Built in Phase 1 on the official A2A JS SDK v1.3 (spec v1.0), with end-to-end tests over JSON-RPC.                                                                                              | High       |
| Is A2A mature enough to build on?                                                 | v1.0 spec, a v0.3 compatibility layer, three transports. Breaking changes are possible (R-10). Mitigation: contract tests and a supported-version window ([13 Interfaces](13-interfaces.md)).        | High       |
| Can the approval gate be made safe against hostile agents?                        | Partly proven: strict validation, offer matching and card-origin pinning are built and tested. The gate itself is Phase 2 design ([10 Architecture](10-architecture.md)).                            | High       |
| Can a business agent read and write the business's real booking tool?             | Square's Bookings API is public and enough for a connector ([30](30-competitive-heuristic-evaluation.md)); other tools are gated (A-03, R-03). Fallbacks: calendar sync, or a Hitchpost-hosted book. | **Medium** |
| Can one person build and run it?                                                  | Within one neighbourhood, with a named backup operator for the pilot, yes. Effort estimate in [16 Project plan](16-project-plan.md).                                                                 | Medium     |

### 4.2 Economic feasibility: Low as a business at this scale, acceptable as a bounded learning bet

A 3-year cash view under stated assumptions. Year 1 runs November 2026 to October 2027; Year 2 November 2027 to October 2028; Year 3 November 2028 to October 2029. The v1 decision (M-08) falls in Year 2 ([16 Project plan](16-project-plan.md)).

**Assumptions (all estimates):**

- **Pricing:** the hypotheses in [03 Business case](03-business-case.md) section 2: people free; $15 per verified business agent line per month (P-26); free for the whole pilot. No per-booking revenue, so booking volume (about 10 honored bookings per business per month at v1, per the release criteria) doesn't change revenue. It only changes value to the business.
- **Businesses, as a scenario, not a forecast:** the pilot neighbourhood (10 businesses) goes live at S1 on 2028-01-11 ([17 Transition plan](17-transition-plan.md)), is free through the pilot and the v1 decision (M-08, 2028-05-09), and pays from June 2028. If the 12-week expansion rule in 03 section 5 passes, a second neighbourhood (15 businesses) starts in September 2028 and pays from December 2028 after a 3-month onboarding period, and a third (15 businesses) starts in March 2029 and pays from June 2029. **60%** of businesses convert to paying (a flat fee has to be justified up front; replaced by the A-05 letter-of-intent and deposit result). That gives 30 paying business-months in Year 2 (10 × 5 × 60%) and 216 in Year 3 ((10 × 12 + 15 × 11 + 15 × 5) × 60%).
- **Costs match [16 Project plan](16-project-plan.md) section 7.2** month by month: AI pair and tools $100 a month; domain $20 a year; Litestream backups $1 a month from March 2027 to May 2028; staging $10 a month and production $80 a month from October 2027 (Phase 6); research incentives $1,150 in Year 1; human external reviews $500 at M-05 (Year 1) and $500 at M-07 (Year 2); the legal pack ($6,500, midpoint of a $5,000 to $8,000 counsel estimate) and the human pentest ($1,500) before M-07, in Year 2. Year 3 hosting is $2,400, sized for about 40 hosted agent lines including backups, monitoring, a signing key per tenant and paging.
- No churn modelled. No platform or subscription-fee income (options D and E are later lines). Owner time excluded (see below).

|                                         | Year 1      | Year 2       | Year 3       |
| --------------------------------------- | ----------- | ------------ | ------------ |
| AI pair and tools                       | $1,200      | $1,200       | $2,000       |
| Domain                                  | $20         | $20          | $20          |
| Backups, staging and production hosting | $98         | $1,087       | $2,400       |
| Research incentives                     | $1,150      | $0           | $0           |
| Human external reviews                  | $500        | $500         | $0           |
| Legal pack (counsel review)             | $0          | $6,500       | $0           |
| Human penetration test                  | $0          | $1,500       | $0           |
| Moderation and misc. (after M-08)       | $0          | $300         | $1,000       |
| **Cash cost**                           | **$2,968**  | **$11,107**  | **$5,420**   |
| **Revenue**                             | **$0**      | **$450**     | **$3,240**   |
| **Net**                                 | **−$2,968** | **−$10,657** | **−$2,180**  |
| **Cumulative**                          | **−$2,968** | **−$13,625** | **−$15,805** |

Hosting arithmetic: Year 1 is Litestream $8 (March to October 2027) + staging $10 + production $80 (October 2027) = $98. Year 2 is Litestream $7 (November 2027 to May 2028) + staging $120 + production $960 (12 months each) = $1,087. Revenue: Year 2 is 30 business-months × $15 = $450; Year 3 is 216 × $15 = $3,240.

**No-expansion scenario** (only the pilot neighbourhood ever pays; Year 3 costs cut to the recurring Year 2 level of $2,607, which is Year 2 without the legal pack, pentest and review, because there is nothing to scale):

|                | Year 1      | Year 2                          | Year 3                            |
| -------------- | ----------- | ------------------------------- | --------------------------------- |
| Revenue        | $0          | $450 (30 business-months × $15) | $1,080 (72 business-months × $15) |
| Net            | −$2,968     | −$10,657                        | −$1,527                           |
| **Cumulative** | **−$2,968** | **−$13,625**                    | **−$15,152**                      |

If Year 3 costs were not cut, the no-expansion cumulative would be about −$17,965; cutting them is part of the stop rule.

**Reconciliation with the project budget.** The spend to the v1 decision (November 2026 to May 2028) is Year 1 ($2,968) plus November 2027 to May 2028 from Year 2 ($700 tools, $20 domain, $7 Litestream, $70 staging, $560 production, $6,500 legal, $1,500 pentest, $500 review = $9,857): **$12,825 before contingency, $15,390 with 20% contingency**, the same figure as [16 Project plan](16-project-plan.md) section 7.2.

**Net present value** at a 10% discount rate, end-of-year cash flows: −$2,968 / 1.10 − $10,657 / 1.21 − $2,180 / 1.331 = −$2,698 − $8,807 − $1,638 = **NPV ≈ −$13,140** (**estimate**). The no-expansion scenario gives −$2,698 − $8,807 − $1,147 = **NPV ≈ −$12,650**. Expansion costs more than it earns within three years, because the second and third neighbourhoods only pay for part of Year 3.

- **Run-rate break-even:** Year 3 monthly cost is about $452; at $15 per paying agent line that's about **31 paying business agent lines**, or about 52 listed businesses at 60% conversion. Three neighbourhoods give 24 paying lines, so the price alone doesn't break even at this scale.
- **Sensitivity:** at $29 per month, near Booksy's published plan, Year 3 revenue would be about $6,260 (216 × $29) and Year 3 net about +$840, with break-even at 16 paying lines. Price is the strongest lever, and it's tested by the A-05 letters of intent and deposits before anything depends on it.
- **My time is not in the table.** About 856 hours to v1 at an opportunity cost of $60 an hour is about $51,000 (**estimate**). With it included, the NPV is strongly negative.

**Conclusion:** at one to three neighbourhoods, Hitchpost doesn't pay for itself on business agent lines alone, and I'm saying so plainly. The cash at risk is bounded, $15,390 with contingency to the v1 decision, and most of it (the legal pack) is spent only if the earlier tests pass. The economic case rests on three things: what the beachhead proves about the protocol and the approval gate; the later revenue lines that scale with the network rather than with neighbourhoods (platform verification, option D; a 10% platform fee on paid agent subscriptions, option E, P-30); and the option to expand. That's acceptable only as long as the decision rules in section 7 are honored.

### 4.3 Operational feasibility: Medium

| Question                                                       | Finding                                                                                                                                                                                                                                                                     | Rating |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Will businesses act on bookings that arrive this way?          | Unproven (A-02). In the pilot, opening hours are standing approval (FR-GATE-05), so Marcus does nothing per booking. Manual shop approval is designed but comes later.                                                                                                      | Medium |
| Will people approve offers instead of using an app or calling? | Unproven (A-01). Tested by a 10-week disclosed Wizard-of-Oz with 30 people before Phase 2 build beyond protocol-safe work.                                                                                                                                                  | Medium |
| Can one person handle onboarding, support and moderation?      | At 5 to 10 businesses (P-22), with SEV1 cover limited to listed opening hours and automatic pause outside them (P-28), and a named backup operator as a go/no-go condition ([17 Transition plan](17-transition-plan.md)). Not beyond one neighbourhood without help (R-11). | Medium |
| Does it fit how businesses already work?                       | Hitchpost sits in front of the existing booking tool rather than replacing it ([01](01-vision-and-scope.md) non-goals).                                                                                                                                                     | High   |

### 4.4 Schedule feasibility: Medium

The expected effort, milestones and dates are in the resource-loaded plan in [16 Project plan](16-project-plan.md), at 15 hours a week of solo capacity (**estimate**), so discovery and build share the same hours. Two changes in this version lengthen the front of the schedule: A-01 now runs 10 weeks instead of 8, and the legal pack's research consent form is needed before A-01 starts. The schedule is sensitive to the booking-system connector (WP-6.5) and how fast businesses can be recruited for the pilot.

### 4.5 Legal and regulatory feasibility: Medium for v1

This section is not legal advice. It lists what has to be checked, and when. The pilot runs in Texas, United States. The detail is in [35 Legal, compliance and governance pack](35-legal-compliance-and-governance.md) and [12 Security and privacy](12-security-and-privacy.md).

| Area                                                                              | Position for v1                                                                                                                                                                                                              | Rating |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Privacy (Texas Data Privacy and Security Act, CCPA/CPRA for California residents) | Minimal data: name, contact, booking times. Data minimisation (NFR-PRIV-01), retention and deletion (NFR-PRIV-02). Applicability of the Texas Act's small-business exemption to be checked. Privacy notice before the pilot. | Medium |
| Consumer protection and "AI" claims (FTC Act section 5)                           | Phases 1 to 3 are rule-based agents and are described that way; offers show the business, total price with tax statement and cancellation terms before approval.                                                             | Medium |
| Electronic agents (Texas UETA, Tex. Bus. and Com. Code ch. 322)                   | Bookings made through electronic agents must give the person a way to correct errors; the approval screen and cancel flow carry that.                                                                                        | Medium |
| Reviews (FTC rule on consumer reviews and testimonials, 16 CFR Part 465)          | Only verified interactions can be rated; no incentivized or fake reviews; a published review and moderation policy with reasons and appeal.                                                                                  | Medium |
| Accessibility (ADA Title III)                                                     | WCAG 2.2 AA on every human-facing surface (NFR-A11Y-01); accessibility statement before v1.                                                                                                                                  | Medium |
| Minors (COPPA)                                                                    | Accounts are 18 and over; minors book through a guardian's agent line.                                                                                                                                                       | High   |
| Notifications (TCPA, CAN-SPAM)                                                    | SMS and email reminders only with recorded consent.                                                                                                                                                                          | Medium |
| Booking platform terms                                                            | Automation may be restricted (R-03). Checked in the A-03 desk audit before Phase 3 starts; Square's public API first.                                                                                                        | Medium |
| Payments and card data                                                            | Out of scope for v1, so no PCI DSS exposure (R-09). Paid subscriptions (stage L4) bring payee KYC, 1099-K reporting and the FTC negative-option rule.                                                                        | High   |
| Liability for wrong bookings                                                      | Approval and audit log on both sides, plus terms of service and business terms reviewed by counsel before S1 (R-07).                                                                                                         | Medium |
| Name and trademark                                                                | "Hitchpost" is a working codename ([ADR 0006](../decisions/0006-working-codename.md)). A trademark search is needed before printed material or public launch.                                                                | Medium |
| Open-source licence                                                               | MIT, with dependency licences checked in CI from Phase 6.                                                                                                                                                                    | High   |

## 5. Alternatives analysis

### 5.1 Alternatives

| ID    | Alternative                          | Summary                                                                                                                                                                           |
| ----- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALT-A | Do nothing                           | Stop after Phase 1. Keep the code as a reference.                                                                                                                                 |
| ALT-B | Plugin for one booking platform      | Build an agent endpoint for one platform's businesses only (for example on Square's public Bookings API). Fresha already does this for itself with an MCP server.                 |
| ALT-C | Agent line network on A2A (proposed) | A neutral, cross-vendor network of agent lines for people and businesses, with the approval gate, directory, verification and reputation. Connectors to booking tools in Phase 6. |
| ALT-D | Consumer-only assistant              | A personal agent that drives businesses' existing websites and apps for the person. No business side, no directory. Google AI Mode already does this with partners.               |

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

- **ALT-B** scores 1 on dependency risk because one platform's API terms decide whether it exists (R-02, R-03). It scores 3 on fit because it fails G-5 (any agent) and G-4 (neutral trust). The verified rival facts in [30](30-competitive-heuristic-evaluation.md) don't change the score: a platform-specific endpoint is exactly what the platforms now build for themselves.
- **ALT-D** scores 1 on defensibility because general assistants already drive websites and book through partners (Google AI Mode with Booksy since November 2025). Driving human-facing websites is also brittle and may break their terms.
- **ALT-C** scores 2 on time and on cost, because it needs a directory and a business side. That's the price of the only option that meets all five goals, and the only one the rivals' silos leave open.

### 5.4 Sensitivity

ALT-C leads ALT-B by 0.80. The single 10-point weight shift that hurts ALT-C most moves weight from fit to time to first value. Even then ALT-C still leads by 0.40. It would take two such shifts at once, for example fit to time and learning to cost, to bring the two level. I accept that: it only happens if I stop caring about the goals in [01](01-vision-and-scope.md). The economic finding in section 4.2 is not a weight in this table; it's handled by the decision rules in section 7.

## 6. Recommendation

**Proceed with ALT-C**, as a bounded learning bet, using ALT-B's integration as the Phase 6 connector (Square first) rather than as the product. The work is staged so that the riskiest assumptions are tested before the money and time that depend on them are spent:

| Before                                         | Test                                                                                          | Assumptions      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| Phase 2 build beyond protocol-safe work (M-01) | 10-week disclosed Wizard-of-Oz with 30 people and pre-registered bands; time-to-book baseline | A-01, A-04       |
| Phase 3 starts (M-02)                          | 10 barber interviews on past behaviour; booking-tool API desk audit; extended competitor scan | A-02, A-03, A-07 |
| Phase 3 starts (M-02), and again at S1         | Defensibility from the scan; letters of intent or refundable deposits from businesses         | A-05             |
| Phase 4 starts                                 | Whether people care which assistant they use (from the A-01 data)                             | A-08             |

## 7. Conditions that would reverse this recommendation

I'd stop or change course if any of these happen. Each maps to a decision rule in [03 Business case](03-business-case.md) section 3.

| Condition                                                                                                                  | Response                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A-01 lands in the kill band: upper bound of the 95% confidence interval under 40% for one completed booking, over 10 weeks | Stop Phase 2 build at M-01. Keep Phase 1 and the protocol-safe work as a reference (ALT-A).       |
| A-01 lands in the iterate band                                                                                             | Change the offer design and re-run a shorter test before Phase 2 build beyond protocol-safe work. |
| A-02 fails: fewer than 3 of 10 barbers show a recent, costly missed-booking problem                                        | Pivot the beachhead to another appointment business where the business side is more eager.        |
| A-03 fails: none of the top 3 tools allows writes                                                                          | Keep ALT-C, with a Hitchpost-hosted book or calendar sync. Re-estimate WP-6.5.                    |
| A-05 fails: fewer than 3 pilot businesses sign a letter of intent or pay a deposit                                         | Reprice, or keep businesses free and test the platform lines (options D and E) earlier.           |
| A-07 fails: a live product covers a neutral, cross-vendor agent network with a two-sided approval record                   | Partner with it or contribute to it. Don't build a competing network.                             |
| Real time per week drops below 8 hours for more than a month                                                               | Re-baseline the schedule in [16 Project plan](16-project-plan.md), or cut Phase 5 to after v1.    |

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Author      |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: one pricing hypothesis ($1 per honored booking, $39 cap, 3 months free); 3-year table rebuilt with a stated shop scenario, NPV at 10% and reconciliation to the 16 budget ($4,140, $4,968 with contingency); schedule and effort from the resource-loaded plan; A-01 redesigned to 8 weeks with the new pass rule                                                                                                                                                                                                                          | S. Jannisar |
| 1.2     | 2026-11-09 | Second remediation after regrade: economics recomputed for the re-baselined plan (pilot live 2027-10-19, paying from February 2028; expansions a month later); staging hosting only from Phase 6; explicit no-expansion scenario (cumulative −$4,540, NPV ≈ −$4,080); scenario NPV ≈ −$880; budget reconciled at $4,320 ($5,184 with contingency); effort 716 h                                                                                                                                                                                                                  | S. Jannisar |
| 1.3     | 2026-11-09 | Round 3: expert panel audit, user-to-user reframing, US jurisdiction: framed as a network of agent lines with booking as the first job; economics rebuilt for $15 per business agent line (P-26), people free, 60% conversion; legal pack $6,500 and research $1,500 in Year 1; scenario cumulative −$13,040 and NPV ≈ −$11,440; no-expansion −$13,610 and NPV ≈ −$11,880; break-even about 31 paying lines; budget to v1 $10,120 ($12,144 with contingency); US/Texas legal review; A-01 redesigned (30 people, 10 weeks, disclosed, confidence bands); rival facts from doc 30 | S. Jannisar |
| 1.4     | 2026-11-09 | Reconciled to the project plan (16 v1.3): milestone dates and budget to v1; economics re-timed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | S. Jannisar |
