# HP-SAD-17 · Transition plan

| Field       | Value                                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document ID | HP-SAD-17                                                                                                                                                                      |
| Version     | 1.1                                                                                                                                                                            |
| Status      | Baselined for Phase 2                                                                                                                                                          |
| Date        | 2026-11-09                                                                                                                                                                     |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                                                                               |
| Conforms to | ISO/IEC/IEEE 15288:2023, Transition process (prepare, perform, manage results) and Validation process; ITIL 4 release management and change enablement practices (informative) |

## 1. Purpose and scope

How Hitchpost moves from a tested build into real use by real barbers and customers in one neighbourhood, without anyone losing a booking. It covers:

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

## 3. Staged pilot design

| Stage                          | When                                | Who                                                     | What runs                                                                                                                                   | Exit criteria                                                                                                                                                                            | Proves              |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **S0. Wizard-of-Oz** (WP-0.1)  | 2026-11-16 to 2027-01-10 (8 weeks)  | About 15 people, any barbers they use                   | No software. I act as each person's agent and as the barber's agent over WhatsApp, following the UC-02 flow by hand                         | At least 60% complete one booking through the agent, at least 30% complete two, and first-offer approval at least 50% (A-01 rule); time-to-book at least 50% faster than baseline (A-04) | A-01, A-04          |
| **S1. Closed alpha** (WP-6.11) | 2027-09-14 to 2027-10-05 (3 weeks)  | 2 friendly barbers, 10 people from S0                   | Phase 2 to 6 pre-pilot build on **staging**, which exists from WP-6.1 (Phase 6); hosted book reconciled with the shop's tool daily, by hand | Zero double bookings; zero bookings without approval; every booking reconciled; barbers would continue                                                                                   | RC 1 under real use |
| **S2. Pilot** (WP-6.9)         | 2027-10-12 to 2028-01-04 (12 weeks) | 5 to 10 barbers in one neighbourhood, target 50+ people | Production build, connector or calendar sync per shop (section 4.3)                                                                         | The v1 release criteria in [01](01-vision-and-scope.md), measured over the last 4 weeks                                                                                                  | RC 1 to RC 6        |
| **S3. v1 decision** (M-08)     | 2028-01-18                          | Me                                                      | Review of S2 results                                                                                                                        | Go: v1 release. Extend: up to 4 more pilot weeks. Stop: apply the kill criteria in [03](03-business-case.md)                                                                             | G-1 to G-5          |

S0 runs 8 weeks because people book every 3 to 4 weeks ([04](04-stakeholders-and-personas.md)); a shorter test couldn't observe a second booking. S1 depends on staging, so it sits inside Phase 6 after WP-6.1, not before it. Dates come from [16 Project plan](16-project-plan.md) section 5.

**Pilot neighbourhood selection:** at least 15 barbershops within walking distance, at least 3 of them from the A-02 interviews willing to list, and close enough for me to visit any shop the same day.

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

C3 carries the highest risk of double booking. Shops on C3 are capped at 3 of the pilot, and each gets a daily reconciliation in hypercare.

### 4.4 At the visit (barber's time, 15 minutes or less)

1. Explain what Hitchpost does and the standing-approval default: bookings in open hours are accepted. Offer the manual-approval switch (FR-GATE-05). (3 min)
2. Confirm services, prices, durations and hours from the draft listing; correct them on the spot. (4 min)
3. Complete the connection authorization (C1), confirm the calendar (C2), or show the hosted book (C3). (4 min)
4. Run one live test booking from my phone; the barber sees it arrive and confirms it in their tool. (3 min)
5. Publish the listing and place the QR code at the counter. (1 min)

### 4.5 After the visit

- [ ] Listing published and searchable (FR-DIR-02).
- [ ] Test booking cancelled and the cancellation seen in the shop's tool.
- [ ] Shop added to the hypercare reconciliation list.
- [ ] Onboarding time recorded for G-2.

## 5. Customer onboarding

1. **Entry points:** the QR code at the counter, a personal invite from the S0 group, or a link shared by the barber.
2. **Install and consent:** the person installs the client app and reads the privacy notice in plain language ([12 Security and privacy](12-security-and-privacy.md)). Account creation asks for a name and a contact method only (NFR-PRIV-01).
3. **First contact:** the QR code adds the shop's agent as a contact directly (FR-APP-01). The built-in personal agent is enabled by default (FR-APP-03).
4. **Guided first booking:** a short in-app walkthrough of the approval screen (FR-APP-02). It covers what will be booked, until when the offer holds, and that nothing happens without a yes.
5. **Follow-up:** a reminder before the appointment, and a single question after it ("Did it go as booked?"). The answer feeds the honored-booking metric.

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

| #   | Item                                                                        | Evidence                            | Traces to              |
| --- | --------------------------------------------------------------------------- | ----------------------------------- | ---------------------- |
| 1   | Phase 2 to 5 gates passed                                                   | Gate records in `docs/audits/`      | M-03 to M-06           |
| 2   | S1 exit criteria met                                                        | S1 report                           | RC 1                   |
| 3   | Pre-release security audit: no open high or critical findings               | Audit report                        | RC 3, WP-6.8           |
| 4   | Agent-to-agent authentication and rate limits on in production              | Config and test evidence            | NFR-SEC-02, NFR-SEC-03 |
| 5   | Monitoring and alerts on the booking path; on-call is me, with phone alerts | Dashboard and a test alert received | RC 4, NFR-OBS-01       |
| 6   | Backups running; a restore tested within the last 14 days                   | Restore log                         | RC 4                   |
| 7   | Incident runbook drilled once                                               | Drill notes                         | RC 4                   |
| 8   | Privacy notice published; retention jobs running; export and delete tested  | Links and test evidence             | RC 5, NFR-PRIV-02      |
| 9   | Terms reviewed by a lawyer                                                  | Review note                         | R-07                   |
| 10  | Per-shop kill switch tested on staging                                      | Test evidence                       | Section 8              |
| 11  | Every launch shop reconciled and signed off (section 6)                     | Onboarding records                  | Principle 1            |
| 12  | Support line staffed, with response targets (P-17) published                | Support page                        | Section 9, P-17        |
| 13  | Rollback rehearsed on staging within the last 7 days                        | Rehearsal notes                     | Section 8              |

## 8. Rollback plan

### 8.1 Triggers

| Severity          | Trigger                                                                                                   | Action                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| SEV1: stop now    | Any double booking caused by Hitchpost; any booking without a logged approval; any personal data exposure | Full rollback (8.3) within 1 hour; incident process per [18](18-deployment-and-operations.md) |
| SEV2: contain     | One shop's sync failing for more than 2 hours; error rate on the booking path above the SLO for 1 hour    | Per-shop rollback (8.2) for the affected shops                                                |
| SEV3: fix forward | Cosmetic or non-booking defect                                                                            | Normal fix through a pull request                                                             |

### 8.2 Per-shop rollback (under 5 minutes)

1. Set the shop's listing to `paused` (a `ListingStatus` value in [09 Data dictionary](09-data-dictionary.md)). Its agent answers new requests with `rejected` and the reason "temporarily unavailable"; open holds and reserved offers are released.
2. Confirm that bookings already made remain in the shop's own tool (C1, C2). For C3, send the barber the list of upcoming Hitchpost bookings.
3. Message affected customers with the shop's phone number and their booking details.
4. Log the rollback in the incident record.

### 8.3 Full rollback (within 1 hour)

1. Pause every listing (one operator action).
2. Redeploy the previous release tag, or keep the service read-only if the defect is in the new release.
3. If data is suspect, restore the last known-good backup (P-15, RPO 5 minutes for infrastructure loss). Confirmed bookings are never lost, because each is committed before `booking_confirmed` is sent ([00](00-document-control.md#10-normative-parameters-and-phase-map)); replay the audit logs on both sides to find bookings made since the restore point and confirm each one with its shop.
4. Send each barber the upcoming-bookings list, and send customers the contact message.
5. Resume only after root cause is found, a test that reproduces it is added, and the go/no-go items affected are re-checked.

## 9. Training and support

| Audience           | Material                                                                  | Format                                        |
| ------------------ | ------------------------------------------------------------------------- | --------------------------------------------- |
| Barbers            | One-page guide: what arrives, how to switch manual approval, how to pause | Printed and PDF                               |
| Barbers            | 2-minute video of a booking arriving in their tool                        | Video link                                    |
| Customers          | In-app walkthrough of the first booking; FAQ                              | In app                                        |
| Developers (Priya) | Contract and conformance tests, listing guide                             | Repo docs ([13 Interfaces](13-interfaces.md)) |
| Operator (Sam)     | Onboarding runbook (section 4), rollback (section 8), moderation steps    | Repo docs                                     |

**Support during the pilot:** one WhatsApp business number and email, staffed by me. The response targets are P-17, kept in one table in [19 Maintenance and evolution](19-maintenance-and-evolution.md#1-support-model); this plan doesn't restate them. During hypercare I also send the daily check-in in section 10, but the committed targets don't change.

A SEV1 report goes straight to the incident process at any time.

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

| Audience              | Message                                         | Channel                     | When                              | Owner |
| --------------------- | ----------------------------------------------- | --------------------------- | --------------------------------- | ----- |
| S0 participants       | Invitation, what to expect, consent             | WhatsApp                    | 2026-11-16                        | Me    |
| Interviewed barbers   | Thanks, results summary, alpha or pilot invite  | In person, message          | After M-02                        | Me    |
| Pilot barbers         | Onboarding date, what changes, support contacts | In person, printed guide    | 1 week before their go-live       | Me    |
| Pilot customers       | How to book by message, privacy notice          | QR code, in app             | At go-live                        | Me    |
| All pilot users       | Planned maintenance, incident notices           | In app, WhatsApp            | 24 hours before; or as it happens | Me    |
| Open-source community | Pilot start, findings, v1 decision              | Repo journey, release notes | M-07, M-08                        | Me    |

## 12. Post-implementation review template

Held 2 weeks after S2 ends and filed in `docs/audits/`.

```markdown
# Post-implementation review: <stage>

- Date, attendees, stage dates
- Goals and release criteria: target vs actual (G-1 to G-5, RC 1 to RC 6)
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

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                  | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline                                                                                                                                                                                                                                                                                                                                                                                          | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: S0 is 8 weeks with the new A-01 rule; S1 moved inside Phase 6 after staging exists (WP-6.11); S2 12 weeks; dates from the re-baselined plan (M-07 2027-10-12, M-08 2028-01-18); hosted agents on their own subdomain; `paused` matches `ListingStatus`; support targets link to P-17 in 19; restore wording uses P-15 and the zero-loss rule; G-2 target restated | S. Jannisar |
