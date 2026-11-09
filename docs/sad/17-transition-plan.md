# HP-SAD-17 · Transition plan

| Field       | Value                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document ID | HP-SAD-17                                                                                                                                                                      |
| Version     | 1.5                                                                                                                                                                            |
| Status      | Frozen for Phase 2 spike                                                                                                                                                       |
| Date        | 2026-11-09                                                                                                                                                                     |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                                                                               |
| Conforms to | ISO/IEC/IEEE 15288:2023, Transition process (prepare, perform, manage results) and Validation process; ITIL 4 release management and change enablement practices (informative) |

## 1. Purpose and scope

How Hitchpost moves from a tested build into real use by real businesses and people in one neighbourhood, without anyone losing a booking. Hitchpost is a network of agent lines between users; the pilot proves it with barbershops, the beachhead vertical ([01](01-vision-and-scope.md)). The pilot runs in Texas, United States, in USD and America/Chicago time. It covers:

- the staged pilot
- onboarding runbooks for barbers and customers
- data conversion
- training and support
- the go/no-go checklist
- rollback
- hypercare
- communications
- the post-implementation review

Operation after hypercare is covered in [18 Deployment and operations](18-deployment-and-operations.md). Dates come from [16 Project plan](16-project-plan.md).

## 2. Transition principles

1. **No booking is ever lost or doubled.** The barber's own booking tool stays the system of record throughout the pilot. Hitchpost writes into it or into a reconciled hosted book. It never runs alongside it unreconciled.
2. **Smallest blast radius first.** Each stage adds users only after the previous stage met its exit criteria.
3. **Every shop can be switched off on its own** in under 5 minutes, with its customers told.
4. **Every number gets measured, not assumed.** The pilot produces the metrics in [01 Vision and scope](01-vision-and-scope.md).
5. **Nobody pays.** Hitchpost is an open protocol with a reference implementation for now (round 5), so the pilot measures adoption, not revenue: agent lines registered, approved bookings through agents (including how many came through the MCP gateway from people's own assistants), independent implementations passing the conformance kit, and repeat use over 8 weeks.

## 3. Staged pilot design

| Stage                          | When                                                                                                                     | Who                                                                                | What runs                                                                                                                                                              | Exit criteria                                                                                                                                                                                                                      | Proves              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **S0. Wizard-of-Oz** (WP-0.1)  | Recruitment 2026-11-10 to 2026-11-29; study 2026-11-30 to 2027-02-21 (10 active weeks, paused over the year-end holiday) | 30 strangers recruited by screener (no friends or family), any businesses they use | No software. A person operates the agent, and participants are told so at consent. A scripted persona with fixed response latency follows the UC-02 flow over WhatsApp | The pre-registered continue / iterate / kill bands for A-01 and A-04 in [03](03-business-case.md), reported with 95% confidence intervals; baselines exclude the owner                                                             | A-01, A-04          |
| **S1. Closed alpha** (WP-6.11) | 2028-01-11 to 2028-02-01 (3 weeks)                                                                                       | 2 friendly businesses (barbershops), 10 people from S0                             | Phase 2 to 6 pre-pilot build on **staging**, which exists from WP-6.1 (Phase 6); standing approval only                                                                | Zero double bookings; zero bookings without approval; every booking reconciled; both businesses keep their listing live to the end of S1 (nobody pays); the kill check in [01](01-vision-and-scope.md) is applied at the end of S1 | RC 1 under real use |
| **S2. Pilot** (WP-6.9)         | 2028-02-01 to 2028-04-25 (12 active weeks); listings stay live through the review to M-08                                | 5 to 10 businesses and 30 to 60 people in one neighbourhood (P-22)                 | Production build, connector or calendar sync per business (section 4.3)                                                                                                | The v1 release criteria in [01](01-vision-and-scope.md), measured over the P-21 window (8 weeks, 2028-03-14 to 2028-05-09)                                                                                                         | RC 1 to RC 6        |
| **S3. v1 decision** (M-08)     | 2028-05-09                                                                                                               | Me                                                                                 | Review of S2 results                                                                                                                                                   | Go: v1 release. Extend: up to 4 more pilot weeks. Stop: apply the kill criteria in [03](03-business-case.md)                                                                                                                       | G-1 to G-5          |

S0 runs 10 active weeks because people book every 3 to 4 weeks ([04](04-stakeholders-and-personas.md)), so each participant gets at least two booking cycles; it pauses over the holiday because the operator is away, and results are analysed per booking cycle. S0 needs the research consent form and P-27 retention before the first invitation. S1 depends on staging, so it sits inside Phase 6 after WP-6.1, not before it. Dates come from [16 Project plan](16-project-plan.md) section 5.

**No holiday pause.** The pilot runs February to April, outside the year-end holiday. Live listings are never paused for an owner holiday or absence: the backup operator covers SEV1 per P-28, and every booking and listing shows the business phone as the fallback. Reduced coverage, if any, is stated on the status page.

**Pilot neighbourhood selection:** at least 15 barbershops within walking distance, at least 3 of them from the A-02 interviews willing to list, and close enough for me to visit any business the same day. Recruitment follows the script and channels in [29 Go-to-market plan](29-go-to-market-plan.md).

## 4. Barber onboarding runbook

Target: the barber's own time at the visit is **15 minutes or less**, done in person by me during S1 and S2. End to end, from signup to the first offer sent, G-2 in [01](01-vision-and-scope.md) targets a median of at most 30 minutes and a 90th percentile of at most 2 hours; section 4.5 records it per shop.

### 4.1 Before the visit (operator, about 20 minutes)

- [ ] Shop's booking tool identified. Connection path chosen per section 4.3.
- [ ] Services, prices, durations and opening hours collected from the public listing or booking page.
- [ ] Listing drafted in the directory, not published.
- [ ] Verification method chosen (section 4.2).

### 4.2 Verification (FR-DIR-01)

| Shop has                        | Method                                                                                                                                                                                                                                             | Evidence kept                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Its own website                 | Well-known token at `/.well-known/` on the shop's domain, or a DNS TXT record                                                                                                                                                                      | Token check result, timestamp                                                         |
| No website (common for barbers) | Agent hosted by Hitchpost on its own subdomain, `<slug>.agents.hitchpost.dev` (WP-6.10), so origin verification can tell hosted shops apart; identity confirmed by an in-person visit plus a phone call to the number on the shop's public listing | Operator verification record: who, when, method, photo of the shop front with consent |

The in-person method is a **pilot procedure**. It doesn't scale beyond one neighbourhood. A scalable method for shops without a domain gets an ADR before any expansion (debt D-14 in [19 Maintenance and evolution](19-maintenance-and-evolution.md)).

### 4.3 Booking-tool connection

Chosen per shop from the A-03 audit result:

| Option                                            | When                                                           | How                                                                                       | Reconciliation                                                                              |
| ------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| C1. MCP connector to the shop's tool (FR-BOOK-06) | The tool allows programmatic reads and writes under its terms  | Shop owner authorizes the connection; the agent reads availability and writes bookings    | Automatic. A daily check compares Hitchpost bookings with the tool.                         |
| C2. Calendar sync                                 | The tool exports and imports a calendar but has no booking API | Busy blocks are read from the calendar; Hitchpost bookings are written as calendar events | Daily check; the barber confirms new bookings appear in the tool                            |
| C3. Hosted book                                   | No usable integration                                          | Hitchpost holds the book; the barber sees Hitchpost bookings in the app                   | Barber blocks Hitchpost slots in their own tool. A daily reminder lists bookings to mirror. |

C3 carries the highest risk of double booking and asks the business to mirror bookings by hand, which the panel review found is the most likely reason a barber leaves. C3 is capped at **1 business** in the pilot, with daily reconciliation in hypercare; if no candidate accepts daily mirroring, C3 is dropped and only C1 and C2 businesses join.

### 4.4 At the visit (barber's time, 15 minutes or less)

1. Explain what Hitchpost does and how approval works in the pilot: standing approval only, so bookings in open hours are accepted, and each booking carries the customer's name and phone (the customer contact block) so the barber knows who is coming. (3 min)
2. Confirm services, prices, durations, hours, legal name, phone and cancellation terms from the draft listing; correct them on the spot. (4 min)
3. Complete the connection authorization (C1), confirm the calendar (C2), or show the hosted book (C3). (4 min)
4. Run one live test booking from my phone; the barber sees it arrive and confirms it in their tool. (3 min)
5. Sign the business terms (no fee, no letter of intent, no deposit: nobody pays); publish the listing and place the QR code at the counter. (1 min)

### 4.5 After the visit

- [ ] Listing published and searchable (FR-DIR-02).
- [ ] Test booking cancelled and the cancellation seen in the shop's tool.
- [ ] Shop added to the hypercare reconciliation list.
- [ ] Onboarding time recorded for G-2.

## 5. Customer onboarding

1. **Entry points:** the QR code at the counter, a personal invite from the S0 group, or a link shared by the barber.
2. **Install and consent:** the person installs the client app (a PWA) and reads the privacy notice and terms in plain language ([12 Security and privacy](12-security-and-privacy.md), [35](35-legal-compliance-and-governance.md)). Accounts are 18+; minors book through a guardian's agent line. Account creation asks for a name and a verified phone only (NFR-PRIV-01). Consent to share the customer contact block with a business is asked at the first booking; SMS reminders need separate TCPA consent.
3. **First contact:** the QR code adds the business's agent line as a contact directly (FR-APP-01). Contacts can be people or businesses (UC-11). The built-in personal agent is enabled by default (FR-APP-03).
4. **Guided first booking:** a short in-app walkthrough of the approval screen (FR-APP-02). It covers what will be booked, the business's legal name and phone, the total price and cancellation terms, the absolute "held until" time, and that nothing happens without a yes.
5. **Follow-up:** reminders 24 hours and 2 hours before the appointment (P-29), and a single question after it ("Did it go as booked?"). The answer feeds the outcome resolution rule (P-25) and the north star.

## 6. Data conversion and migration

There is no legacy Hitchpost data to migrate. Conversion means bringing each shop's existing setup into Hitchpost correctly.

| Data                        | Source                                                 | Target                                                    | Rule                                                                | Check                                                                      |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Services, durations, prices | Public listing or booking page; confirmed at the visit | `Service` in [08 Data design](08-data-design.md)          | Prices in integer cents; durations in whole minutes                 | Barber confirms every line at the visit                                    |
| Opening hours               | Same                                                   | `OpeningHours`, with the shop's IANA time zone (ADR 0018) | Local times stored with the zone; UTC on the wire                   | Test offer at opening and at closing time is correct                       |
| Existing bookings           | Shop's tool (C1, C2) or the barber's word (C3)         | Busy blocks: start and duration only                      | **No customer names or contact details are imported** (NFR-PRIV-01) | Count of busy blocks for the next 14 days matches the tool; 10 spot checks |
| Shop identity               | Verification (section 4.2)                             | `DirectoryListing` and verification record                | Per FR-DIR-01                                                       | Listing shows the verified status (FR-DIR-05)                              |

**Reconciliation sign-off:** a shop goes live only after the busy-block count matches and the test booking round-trips. The operator records both in the shop's onboarding record.

## 7. Cutover: go/no-go checklist for S2 (milestone M-07)

Every item must be **Go**. Any **No-go** item moves the go-live date.

| #   | Item                                                                                                                                                                                     | Evidence                         | Traces to              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------- |
| 1   | Phase 2 to 5 gates passed                                                                                                                                                                | Gate records in `docs/audits/`   | M-03 to M-06           |
| 2   | S1 exit criteria met                                                                                                                                                                     | S1 report                        | RC 1                   |
| 3   | Pre-pilot security audit and human pentest: no open high or critical findings                                                                                                            | Audit and pentest reports        | RC 3, WP-6.8           |
| 4   | Human external review before M-07: no open high findings                                                                                                                                 | Review note                      | WP-6.8                 |
| 5   | Agent-to-agent authentication and rate limits on in production                                                                                                                           | Config and test evidence         | NFR-SEC-02, NFR-SEC-03 |
| 6   | Monitoring, paging and the status page live on the booking path; the auto-pause (P-28) fires on an unacknowledged test alert                                                             | Dashboard, test alert, pause log | RC 4, NFR-OBS-01, P-28 |
| 7   | **Backup operator named, runbooks handed over, one-command pause drilled** (WP-6.13)                                                                                                     | Drill notes                      | P-28, R-11             |
| 8   | Backups running; a restore tested within the last 14 days                                                                                                                                | Restore log                      | RC 4                   |
| 9   | Incident runbook drilled once                                                                                                                                                            | Drill notes                      | RC 4                   |
| 10  | Legal pack reviewed by counsel and published: terms, privacy notice, business terms, review and moderation policy, accessibility statement ([35](35-legal-compliance-and-governance.md)) | Links and review note            | R-07, RC 5             |
| 11  | Retention jobs running; export and delete tested                                                                                                                                         | Test evidence                    | RC 5, NFR-PRIV-02      |
| 12  | Per-business kill switch tested on staging                                                                                                                                               | Test evidence                    | Section 8              |
| 13  | Every launch business reconciled and signed the business terms (free; no letter of intent or deposit)                                                                                    | Onboarding records               | Principle 1, WP-6.14   |
| 14  | Support line staffed, with response targets (P-17) and coverage (P-28) published                                                                                                         | Support page                     | Section 9, P-17, P-28  |
| 15  | Rollback rehearsed on staging within the last 7 days                                                                                                                                     | Rehearsal notes                  | Section 8              |

## 8. Rollback plan

### 8.1 Triggers

Severities and their triggers are defined once, in the [SEV table in 19](19-maintenance-and-evolution.md#1-support-model). This plan only says what each one means for the pilot.

| Severity | Pilot action                                                                                  |
| -------- | --------------------------------------------------------------------------------------------- |
| SEV1     | Full rollback (8.3) within 1 hour; incident process per [18](18-deployment-and-operations.md) |
| SEV2     | Per-shop rollback (8.2) for the affected shops                                                |
| SEV3     | Normal fix through a pull request                                                             |

### 8.2 Per-shop rollback (under 5 minutes)

1. Set the business's listing to `paused` (a `ListingStatus` value in [09 Data dictionary](09-data-dictionary.md)). Its agent answers new requests with `rejected` and the reason "temporarily unavailable"; open holds are released.
2. Confirm that bookings already made remain in the shop's own tool (C1, C2). For C3, send the barber the list of upcoming Hitchpost bookings.
3. Message affected customers with the shop's phone number and their booking details.
4. Log the rollback in the incident record.

### 8.3 Full rollback (within 1 hour)

1. Pause every listing (one operator action).
2. Redeploy the previous release tag, or keep the service read-only if the defect is in the new release.
3. If data is suspect, restore the last known-good backup (P-15). The RPO is 0 for a process crash or single-node loss, because each booking is committed synchronously before `booking_confirmed` is sent; for region loss it is 5 minutes, and confirmed bookings in that window are rebuilt from the personal-side `booking_confirmed` copies ([18](18-deployment-and-operations.md) section 9). Replay the audit logs on both sides to find bookings made since the restore point and confirm each one with its business.
4. Send each barber the upcoming-bookings list, and send customers the contact message.
5. Resume only after root cause is found, a test that reproduces it is added, and the go/no-go items affected are re-checked.

## 9. Training and support

| Audience           | Material                                                                                                   | Format                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Barbers            | One-page guide: what arrives (including the customer's name and phone), how to mark outcomes, how to pause | Printed and PDF                               |
| Barbers            | 2-minute video of a booking arriving in their tool                                                         | Video link                                    |
| Customers          | In-app walkthrough of the first booking; FAQ                                                               | In app                                        |
| Developers (Priya) | Contract and conformance tests, listing guide                                                              | Repo docs ([13 Interfaces](13-interfaces.md)) |
| Operator (Sam)     | Onboarding runbook (section 4), rollback (section 8), moderation steps                                     | Repo docs                                     |

**Support during the pilot:** one WhatsApp business number and email, staffed by me with the backup operator. The response targets are P-17 and the coverage is P-28, kept in one table in [19 Maintenance and evolution](19-maintenance-and-evolution.md#1-support-model); journeys, macros and escalation are in the [36 Customer support and success playbook](36-customer-support-and-success-playbook.md). During hypercare I also send the daily check-in in section 10, but the committed targets don't change.

A SEV1 report goes straight to the incident process. During listed businesses' opening hours the 1-hour response applies; at any time, a SEV1 alert left unacknowledged for 30 minutes pauses all listings automatically (P-28).

## 10. Hypercare

- **Duration:** the first 14 days after each shop goes live. It's per shop, so the pilot runs rolling hypercare.
- **Daily during hypercare:**
  - reconcile Hitchpost bookings with the shop's tool
  - review the audit log for any booking without an approval
  - review errors on the booking path
  - send a 1-line check-in to the barber
- **Exit criteria per shop:**
  - 10 consecutive days with zero reconciliation differences
  - at least 5 honored bookings
  - zero SEV1 or SEV2 incidents in the last 7 days
  - the barber confirms they want to continue
- **On exit:** the shop moves to normal operations and weekly reconciliation.

## 11. Communications plan

| Audience               | Message                                                                                             | Channel                       | When                              | Owner |
| ---------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------- | ----- |
| S0 participants        | Screener, invitation, disclosure that a person operates the agent, consent form                     | Screener link, WhatsApp       | 2026-11-10 to 2026-11-29          | Me    |
| Interviewed barbers    | Thanks, results summary, alpha or pilot invite                                                      | In person, message            | After M-02                        | Me    |
| Pilot barbers          | Onboarding date, what changes, support contacts                                                     | In person, printed guide      | 1 week before their go-live       | Me    |
| Pilot customers        | How to book by message, privacy notice                                                              | QR code, in app               | At go-live                        | Me    |
| All pilot users        | Planned maintenance, incident notices                                                               | In app, WhatsApp, status page | 24 hours before; or as it happens | Me    |
| Public and local press | Holding statement after a SEV1 that affected people (crisis comms in [29](29-go-to-market-plan.md)) | Repo, status page             | Within 24 hours of a SEV1         | Me    |
| Open-source community  | Pilot start, findings, v1 decision                                                                  | Repo journey, release notes   | M-07, M-08                        | Me    |

## 12. Post-implementation review template

Held 2 weeks after S2 ends and filed in `docs/audits/`.

```markdown
# Post-implementation review: <stage>

- Date, attendees, stage dates
- Goals and release criteria: target vs actual (G-1 to G-5 and every release criterion in 01)
- Adoption: agent lines registered, independent implementations passing the conformance kit, approved bookings by channel (Hitchpost app vs the MCP gateway from people's own assistants), repeat use over 8 weeks, businesses still live at the end
- North star and counter-metrics: weekly trend, baseline comparison (A-04)
- Assumption results: A-01 to A-08, each confirmed, refuted or open, with evidence
- Incidents: count by severity, root causes, fixes, tests added
- Onboarding: median barber time (G-2), verification issues, connection option mix (C1, C2, C3)
- Support: volume, response times vs targets, top 5 questions
- Cost: cash spent vs budget in HP-SAD-16, hours spent vs estimate
- What worked, what didn't, what I'd change
- Decision: go, extend or stop, with reasons
- Actions: owner, due date, tracking issue
```

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 1.0     | 2026-11-09 | First baseline                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: S0 is 8 weeks with the new A-01 rule; S1 moved inside Phase 6 after staging exists (WP-6.11); S2 12 weeks; dates from the re-baselined plan (M-07 2027-10-12, M-08 2028-01-18); hosted agents on their own subdomain; `paused` matches `ListingStatus`; support targets link to P-17 in 19; restore wording uses P-15 and the zero-loss rule; G-2 target restated                                                                                                                                                                                    | S. Jannisar |
| 1.2     | 2026-11-09 | Second remediation after regrade: S1 2027-09-21 to 2027-10-12, S2 2027-10-19 to 2028-01-25 with a 2-week holiday pause (listings paused, no SEV1 cover promised), M-08 2028-02-08; RC 1 and RC 2 window before the pause; rollback triggers now cite the single SEV table in 19                                                                                                                                                                                                                                                                                                            | S. Jannisar |
| 1.3     | 2026-11-09 | Round 3: expert panel audit, user-to-user reframing, US jurisdiction: pilot in Texas; S0 disclosed, 30 strangers by screener, 10 active weeks with research consent; S1 2028-01-11 to 2028-02-01 with letters of intent or deposits; S2 2028-02-01 to 2028-04-25, M-08 2028-05-09; no holiday pause of live listings (business phone fallback, P-28); standing approval only; C3 capped at 1 business; backup operator, human pentest, human external review and counsel-reviewed legal pack added to go/no-go; RPO restated; recruitment and crisis comms link to 29; support links to 36 | S. Jannisar |
| 1.5     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | S. Jannisar |
