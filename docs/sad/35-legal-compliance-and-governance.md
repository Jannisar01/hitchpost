# HP-SAD-35 · Legal, compliance and governance

| Field       | Value                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------- |
| Document ID | HP-SAD-35                                                                                           |
| Version     | 1.1                                                                                                 |
| Status      | Frozen for Phase 2 spike                                                                            |
| Date        | 2026-11-09                                                                                          |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                    |
| Conforms to | NIST Privacy Framework 1.0; ISO 37301:2021 compliance management systems (structure, not certified) |

> **Not legal advice.** This document identifies legal and regulatory risks and how the design responds to them. It is written by the product owner, not a lawyer. Every outline in section 5 must be reviewed by qualified counsel licensed in Texas before it is used with real people (budgeted in WP-6.7; the research consent form is pulled forward into WP-0.1).

## 1. Purpose and scope

What law and governance the pilot and v1 must satisfy, how the design meets each obligation, where the gaps are, and who decides what. It answers the security, legal, governance and accessibility panel, which rated v1 "not ready" mainly because terms, a privacy notice, business terms, a jurisdiction and a governance model did not exist.

## 2. Jurisdiction

| Item               | Decision                                                                          |
| ------------------ | --------------------------------------------------------------------------------- |
| Pilot jurisdiction | United States, one neighbourhood in Texas                                         |
| Currency and time  | USD; America/Chicago (shop-local time per ADR 0018 in Phase 6)                    |
| Users              | Adults 18+ with accounts; minors book through a guardian's agent line (section 6) |
| Outside the US     | Not offered in v1. EU expansion is Later (section 9)                              |

A US-first stance replaces the GDPR-first reasoning in earlier drafts of [12 Security and privacy](12-security-and-privacy.md). GDPR remains a useful design standard (data minimisation, purpose limitation), and I keep meeting it where it costs little.

## 3. Applicability analysis by law

Status: **Met** (the design meets it), **Partial** (designed, gaps listed), **Gap** (not yet designed), **Later** (applies only to a later phase).

| Law                                                                | Applies because                                                                                                       | Key obligations                                                                                                                                                                                                                                                       | How the design meets it                                                                                                                                                          | Status and gaps                                                                                                                                                                                    |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FTC Act section 5 (unfair or deceptive practices)                  | Any consumer-facing service in the US                                                                                 | No deceptive claims; no "AI washing" (standard wording: "Hitchpost agents are rule-based software until a language model is added (the language-model stage); we don't call them AI before then"); no pricing to disclose while nobody pays; reasonable data security | Phases 1 to 3 described as rule-based agents ([32 §8](32-automation-boundaries.md#8-ai-transparency)); flat published price; security design in [12](12-security-and-privacy.md) | Partial: marketing copy review checklist needed before S1 ([29](29-go-to-market-plan.md))                                                                                                          |
| FTC rule on consumer reviews and testimonials (16 CFR Part 465)    | Phase 5 ratings                                                                                                       | No fake reviews; no suppressing honest negative reviews; no undisclosed insider reviews; no buying reviews                                                                                                                                                            | Only verified interactions can be rated (FR-RATE-01); moderation policy with reasons and appeal (section 5.4)                                                                    | Partial: policy text and suppression-safe moderation rules needed before ratings go public                                                                                                         |
| Texas UETA (Tex. Bus. and Com. Code ch. 322)                       | Bookings made by electronic agents are electronic transactions                                                        | Contracts formed by electronic agents are valid; an individual dealing with an electronic agent must have a way to prevent or correct an error, or the error may make the transaction avoidable                                                                       | Every commitment shows typed facts and needs an explicit yes (FR-GATE-01); cancel and reschedule exist (FR-BOOK-03); offers must match the request (FR-MSG-04)                   | Partial: an explicit "I made a mistake" path right after booking, and terms that describe how agent-formed bookings work                                                                           |
| Texas Data Privacy and Security Act (TDPSA)                        | Processing Texas residents' personal data                                                                             | Privacy notice; consumer rights (access, correct, delete, portability, opt out of sale and targeted ads); data protection assessments for some processing                                                                                                             | Data minimisation (NFR-PRIV-01); no sale, no targeted ads; retention P-11 to P-15; export and delete (NFR-PRIV-02)                                                               | Partial: confirm applicability (TDPSA's small-business carve-out is tied to the SBA definition, but it still bars selling sensitive data without consent); notice text; rights process (section 7) |
| CCPA/CPRA                                                          | Only if California residents use it and thresholds are met                                                            | Notice at collection; rights; no sale or sharing without opt-out                                                                                                                                                                                                      | Same design as TDPSA                                                                                                                                                             | Later: thresholds not met in a Texas pilot; revisit before any California use                                                                                                                      |
| ADA Title III                                                      | Digital surfaces of a public-facing service                                                                           | Accessible app, dashboard, directory, notifications                                                                                                                                                                                                                   | WCAG 2.2 AA for every human-facing surface (NFR-A11Y-01, round 3); accessibility statement (section 5.6)                                                                         | Partial: conformance report and assistive-technology test matrix before v1                                                                                                                         |
| COPPA                                                              | Any user under 13                                                                                                     | Verifiable parental consent                                                                                                                                                                                                                                           | Accounts 18+ only; no knowing collection from children (section 6)                                                                                                               | Met by policy; age gate needed in the app                                                                                                                                                          |
| TCPA and CAN-SPAM                                                  | SMS and email notifications and reminders (P-29)                                                                      | Prior express consent for automated texts; opt-out; sender identity                                                                                                                                                                                                   | SMS reminders only with recorded consent; in-app reminders by default; unsubscribe in every email                                                                                | Partial: consent capture and record (section 8)                                                                                                                                                    |
| Texas breach notification (Tex. Bus. and Com. Code §521.053)       | Personal data held about Texans                                                                                       | Notify affected people without unreasonable delay and within the statutory deadline; notify the Attorney General above a size threshold                                                                                                                               | Incident process ([18](18-deployment-and-operations.md)); data incident holding statement ([29 §14](29-go-to-market-plan.md#14-crisis-communications-runbook))                   | Partial: confirm current deadlines with counsel and put them in the runbook                                                                                                                        |
| Texas Responsible AI Governance Act (HB 149, effective 2026-01-01) | Possibly, once a language model is added (AI system) and for disclosure duties toward consumers; confirm with counsel | Confirm with counsel which duties apply to a private developer of agent software in Texas (disclosure when people interact with an AI system, prohibited uses)                                                                                                        | Until the language-model stage, Hitchpost agents are rule-based software and are described that way; disclosure designed into the app before any model is added                  | Later; **confirm with counsel**                                                                                                                                                                    |

### 3.1 Later-phase obligations: relationships, consultation and paid subscriptions

**Nobody pays now (round 5).** Hitchpost is an open protocol with a reference implementation. Every payment obligation below (negative option, payouts, KYC, 1099-K, refunds) is **Later**: it applies only if paid subscriptions (stage L4, unpriced) are ever built.

The agent-network expansion (relationships, consultation between agents, profiles, paid subscriptions) adds obligations that apply only when those phases arrive. I record them now so the design leaves room for them.

| Area                                                                          | Obligation                                                                                                                                                                                                                                | Design response                                                                                                                                                                                                     | Status |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Paid subscriptions: FTC negative option rule and state automatic-renewal laws | Clear disclosure of recurring terms before payment; express informed consent; cancellation at least as easy as sign-up (the "click to cancel" principle; check the federal rule's current status with counsel, and state laws regardless) | One-tap cancel in the same place as subscribe; renewal reminder; terms shown before the first charge ([32 §4.3](32-automation-boundaries.md#43-the-agent-network-expansion-phases): subscribe is human in the loop) | Later  |
| Payouts to people and businesses                                              | Payments provider handles KYC for payees and card data (PCI DSS stays with the provider); Form 1099-K reporting through the provider; refunds and chargebacks                                                                             | Use a payments provider with connected accounts; Hitchpost never stores card numbers; platform fee hypothesis 10%                                                                                                   | Later  |
| Harassment, blocking and safety                                               | Clear conduct rules; block and report; respond to threats and stalking; preserve evidence                                                                                                                                                 | Block switch ([32 §7](32-automation-boundaries.md#7-kill-switches)); report flow; rate limits per relationship; moderation trail                                                                                    | Later  |
| Minors in the network                                                         | No accounts under 18; no friend or follower relationships with minors; guardian-managed lines only for booking                                                                                                                            | Age gate; relationship features disabled for guardian-managed lines                                                                                                                                                 | Later  |
| Consent for knowledge sharing                                                 | An agent answering about its owner shares only what the owner chose, per tier; third parties mentioned in an owner's knowledge are not exposed                                                                                            | Scope enforcement by policy ([32 §5](32-automation-boundaries.md#5-scope-enforcement-is-policy-not-a-model)); owner activity log; default deny; personal data about others excluded from shareable scopes           | Later  |
| Section 230 and user content                                                  | Platform liability protections for third-party content; obligations still apply for IP takedowns (DMCA)                                                                                                                                   | DMCA agent registration and takedown process before any user-published content                                                                                                                                      | Later  |

## 4. Gaps that block the pilot (S1)

1. Terms of service, privacy notice and business terms reviewed by counsel (section 5).
2. Research consent form for A-01 (needed before S0 starts, not S1).
3. UETA error-correction path in the booking flow.
4. TCPA consent capture if any SMS is sent.
5. Accessibility statement and age gate.
6. A named backup operator (governance, section 10.3).

## 5. Document outlines (headings and key clauses, not legal text)

### 5.1 Terms of service (people)

1. Who we are and what an agent line is
2. Eligibility: 18+; one account per person; guardian-managed lines for minors' bookings
3. How bookings work: your agent sends requests; a booking exists only after you approve and the business's line confirms; the business, not Hitchpost, provides the service
4. Your responsibilities: accurate information; keep your device secure; don't misuse other people's agents
5. Mistakes: how to cancel or correct right after booking (UETA error path)
6. Cancellations and no-shows: the business's terms apply and are shown before you approve
7. Ratings and content: only about real interactions; our review policy (section 5.4)
8. Acceptable use: no scraping, spam, impersonation, prompt-injection attempts, harassment
9. Availability and changes to the service; open source code vs the hosted service
10. Disclaimers and limitation of liability (counsel to draft)
11. Disputes and governing law: Texas
12. Contact and notices

### 5.2 Privacy notice

1. What we collect: account, contact details, agent line data, booking records, audit events, device and install key
2. What we don't collect or do: no sale of data, no targeted advertising, no reading of your conversations with your own assistant
3. Why we use it (purposes) and the minimum shared with each business (customer contact block, round 3)
4. Who we share with: the business you book with; service providers (hosting); legal requests
5. Retention: P-11 to P-15 in plain words
6. Your rights: access, correct, delete, portability, opt out; how to ask; response time (section 7)
7. Security summary and breach notification
8. Children: not for under 18s
9. Changes to this notice and contact

### 5.3 Business terms with service-provider data terms

1. The agent line service and the pilot (free; nobody pays, and there is no price)
2. The business's obligations: honour bookings it confirmed; keep hours and services accurate; cancellation terms shown to customers
3. Standing approval: opening hours are the business's standing approval of bookings within them
4. Connection to the business's booking tool: what Hitchpost reads and writes
5. Data: for customer data Hitchpost handles on the business's behalf, Hitchpost acts as a service provider (processor): only on instructions, confidentiality, security, subprocessors listed, help with consumer requests, deletion at the end
6. Verification and listing; suspension and removal with a statement of reasons and appeal
7. No fees, letters of intent or deposits; the business can leave at any time
8. Liability split: the service is the business's; the line is Hitchpost's
9. Term, termination, data return

### 5.4 Review and moderation policy

1. Who can rate: only people with a verified interaction (FR-RATE-01)
2. What we never do: write, buy or filter honest reviews by sentiment; let businesses or staff rate themselves (16 CFR Part 465)
3. Removal grounds: illegal content, personal data, threats, conflicts of interest, off-topic
4. Process: report, review within the published time, decision with a statement of reasons to both sides
5. Appeal: one appeal, decided by someone other than the first reviewer once a second person exists; until then, recorded and reviewed by the external human reviewer at the next review point
6. Listing suspension for safety: when auto-pause can apply, how a business is told, how to get back

### 5.5 Research consent form (A-01)

1. Purpose of the study and who runs it
2. **Disclosure: a person operates the agent during this study** (round 3)
3. What you'll do and for how long (10 weeks)
4. What we record (messages, times, booking outcomes) and what we don't
5. Voluntary: stop at any time, no reason needed
6. Retention: research data deleted 90 days after the study ends (P-27)
7. Risks and benefits; any thank-you payment
8. Contact; signature and date; copy for the participant

### 5.6 Accessibility statement

1. Commitment and standard: WCAG 2.2 AA for every human-facing surface
2. Conformance status per surface, with known gaps and dates
3. Tested with: VoiceOver, TalkBack, NVDA (assistive-technology matrix)
4. How to report a barrier and the response time
5. Date of last review

## 6. Age policy

Accounts are 18+. Minors book haircuts, so a guardian's agent line can book for them; the minor has no account and no relationships. The app asks for date of birth at sign-up and blocks under 18. No knowing collection of data from children under 13 (COPPA).

## 7. Data subject request process

| Request          | Who can ask        | How                                                                | Response time                                                                                           | Notes                                                                                                    |
| ---------------- | ------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Access or export | The account holder | In the app (Phase 4); by email to the published contact until then | Within 45 days (TDPSA standard; aim for 15)                                                             | Includes both sides' records about them                                                                  |
| Correct          | The account holder | Same                                                               | Within 45 days                                                                                          | Bookings already completed are corrected by annotation, not rewritten                                    |
| Delete           | The account holder | Same                                                               | Erased from live systems within 30 days; from backups by expiry, fully gone within 60 days (P-13, P-15) | Audit evidence a business needs for a dispute in progress is kept until the dispute closes, then deleted |
| Opt out          | Anyone             | Same                                                               | Immediately for marketing                                                                               | No sale or targeted ads to opt out of today                                                              |

Identity is verified through the account; requests are logged with their outcome (section 8).

## 8. Consent records

| Consent                                   | When captured                       | Record kept                      | Withdrawal                                              |
| ----------------------------------------- | ----------------------------------- | -------------------------------- | ------------------------------------------------------- |
| Terms and privacy notice acceptance       | Sign-up                             | Version, time, account           | Close the account                                       |
| SMS reminders (TCPA)                      | When turning SMS on                 | Phone, time, exact wording shown | Reply STOP or toggle off                                |
| Research participation (A-01)             | Before S0                           | Signed form, version             | Any time; data deleted per P-27                         |
| Sharing scopes and relationships (Later)  | When the owner sets or changes them | Scope, tier, time                | Owner changes them; effect is immediate                 |
| Ratings becoming public (business opt-in) | After the pilot                     | Business, time                   | Business withdraws; reviews go back to private feedback |

## 9. EU delta (Later)

Before any EU use: GDPR lawful bases per purpose; Article 28 processor terms; records of processing; DPIA for agent-to-agent consultation; EU AI Act Article 50 transparency once any model composes answers; the Platform-to-Business Regulation (2019/1150) for business listings (reasons for suspension, complaint handling); the Digital Services Act for moderation; the European Accessibility Act. None of this is in scope for the Texas pilot.

## 10. Governance

### 10.1 Decision rights and RACI

R responsible, A accountable, C consulted, I informed. "External reviewer" means the human reviewer named at M-05 and M-07.

| Activity                                      | Owner (me) | Backup operator            | External reviewer     | Business             | Person |
| --------------------------------------------- | ---------- | -------------------------- | --------------------- | -------------------- | ------ |
| Moderation decision                           | A, R       | R (when owner unavailable) | C (appeals sample)    | I                    | I      |
| Moderation appeal                             | A          | R (if not first reviewer)  | C                     | C                    | C      |
| SEV1 incident                                 | A, R       | R                          | I                     | I                    | I      |
| Data subject request                          | A, R       | C                          | I                     | C (if their records) | I      |
| Release to production                         | A, R       | C                          | C (at M-05 and M-07)  | I                    | I      |
| Change to the parameter register or phase map | A, R       | I                          | C                     | I                    | I      |
| Legal text publication                        | A          | I                          | C (counsel signs off) | I                    | I      |

### 10.2 Risk appetite

| Area                                                         | Appetite      | Meaning                                                                                        |
| ------------------------------------------------------------ | ------------- | ---------------------------------------------------------------------------------------------- |
| Booking integrity (double booking, booking without approval) | Zero          | Any occurrence is SEV1 and pauses the business's line                                          |
| Personal data exposure                                       | Zero          | Any exposure is SEV1                                                                           |
| Legal non-compliance                                         | Very low      | No pilot launch with a section 4 gap open                                                      |
| Schedule slip                                                | Moderate      | Up to the reserve in [16](16-project-plan.md); beyond that, cut scope before quality           |
| Product risk (people don't adopt)                            | High, bounded | Accepted as the reason for running cheap tests first; capped by kill criteria and cash at risk |

### 10.3 Continuity

A named backup operator is a go/no-go condition for the pilot (round 3). The backup holds access to the one-command pause, the status page and the business contact list, and has done one dry run before M-07.

### 10.4 GOVERNANCE.md outline (for the repository)

1. Roles: maintainer (me), committers, contributors
2. Decision making: ADRs for significant decisions; the parameter register and phase map change only through `docs-change`
3. Becoming a committer: criteria and process
4. Succession: who takes over if the maintainer is unavailable for 30 days; repository and domain access held in escrow with the backup operator
5. Code of conduct enforcement: reports to the maintainer privately; outcomes recorded
6. Security disclosure: per SECURITY.md
7. Brand: link to the trademark and brand policy

### 10.5 Trademark and brand policy

The code is MIT; the name and the "verified" badge are not. Forks may use the code but not the name, the logo or the badge, and may not present themselves as the hosted service. The badge is shown only for listings the hosted directory verified. The final name is registered after the naming decision ([29 §6](29-go-to-market-plan.md#6-naming-decision)).

### 10.6 External human review

All reviews so far were AI-assisted reviews run as separate Claude Code agents under my direction ([00](00-document-control.md)). Before the pilot, at least one human external reviewer reviews the design and security at M-05 and the go/no-go at M-07. Their findings are recorded in docs/audits with the same format as earlier reviews.

### 10.7 Audit evidence retention

| Evidence                                 | Retention                                               |
| ---------------------------------------- | ------------------------------------------------------- |
| Decision records (ADRs), audits, journey | Permanent, in the repository                            |
| Consent records                          | Life of the account plus 3 years, or as counsel advises |
| Moderation trail                         | P-14                                                    |
| Incident reports                         | 3 years                                                 |
| Data subject request log                 | 2 years                                                 |

## Revision history

| Version | Date       | Change                                                                                                        | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline                                                                                                | S. Jannisar |
| 1.1     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike | S. Jannisar |
