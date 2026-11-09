# 03. Stakeholders and personas

- **Status:** Draft, 2026-11-08
- **Owner:** Sanaullah Jannisar
- **Stage:** Analysis

## Stakeholder map

| Stakeholder                                           | Interest                                                         | Influence                          | How I engage                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| Customers (Dana)                                      | Book fast, no surprises, privacy                                 | High: adoption decides everything  | Wizard-of-Oz test (A-01), app feedback, ratings                   |
| Barbers and shop owners (Marcus)                      | More bookings, fewer missed calls, no double-booking, low effort | High: supply side                  | Interviews (A-02), in-person setup, weekly check-ins              |
| Agent developers (Priya)                              | Get their agent listed, trusted and used                         | Medium: interop and growth         | Open docs, open source, Agent Card spec, contract tests           |
| Directory operator and moderator (Sam)                | Keep listings real and abuse low                                 | Medium                             | Admin tools (Phase 6), runbooks                                   |
| Booking platforms (Booksy, Square, Fresha and others) | Keep customers in their ecosystem; API terms                     | High: they control calendar access | Read API terms (A-03), approach as partners, never scrape         |
| A2A and MCP communities                               | Protocol adoption and correct use                                | Medium: protocol direction         | Follow the spec, report issues, contribute fixes                  |
| Regulators (privacy, consumer protection)             | Lawful data handling; fair practices                             | High if payments come              | Privacy by design, no payments in v1, legal review before Phase 6 |
| Contributors                                          | Interesting, well-run open-source project                        | Low to medium                      | CONTRIBUTING, good first issues, fast reviews                     |
| Hiring managers and peers                             | Evidence of how I lead a build                                   | Low on product, high for me        | Journey, ADRs, audits, honest bug log                             |

```mermaid
quadrantChart
    title Influence vs interest
    x-axis Low interest --> High interest
    y-axis Low influence --> High influence
    quadrant-1 Manage closely
    quadrant-2 Keep satisfied
    quadrant-3 Monitor
    quadrant-4 Keep informed
    Customers: [0.9, 0.9]
    Barbers: [0.85, 0.85]
    Booking platforms: [0.4, 0.85]
    Regulators: [0.3, 0.7]
    Agent developers: [0.7, 0.5]
    A2A community: [0.5, 0.5]
    Operator: [0.8, 0.45]
    Contributors: [0.6, 0.25]
```

## Responsibilities (RACI-lite)

R = does the work, A = owns the decision, C = consulted, I = informed. "Me" is the maintainer, who is also Sam until there's a separate operator.

| Activity                    | Me   | Barbers                                  | Customers            | Contributors | Platforms |
| --------------------------- | ---- | ---------------------------------------- | -------------------- | ------------ | --------- |
| Product direction and scope | A, R | C                                        | C                    | I            | I         |
| Architecture and ADRs       | A, R |                                          |                      | C            |           |
| Code changes and review     | A    |                                          |                      | R            |           |
| Listing and verification    | A, R | R (provide details)                      |                      |              | C (API)   |
| Approving bookings          |      | A for the shop's time (Phase 2 decision) | A for their own time |              |           |
| Moderation and reports      | A, R | C                                        | R (report)           |              |           |
| Security response           | A, R | I                                        | I                    | C            | I         |
| Releases and operations     | A, R | I                                        | I                    | C            |           |

One open decision for Phase 2: does Marcus approve each booking, or do opening hours count as his standing approval? My working answer is standing approval by default, with a per-shop switch for manual approval. It gets confirmed in the A-02 interviews.

## Personas

### Dana, customer

- **Context:** 34, works hybrid, books a haircut every 3 to 4 weeks, usually remembers late. Has an assistant app on her phone.
- **Goals:** get a slot that fits after work without calling; know it's really booked.
- **Pains:** phone calls during work hours; every shop uses a different app; booking forms on a phone; finding out the slot was gone.
- **What she needs from Hitchpost:** one message, one clear offer, one tap to approve, confirmation she can trust.
- **What would make her leave:** a wrong booking, or approvals that feel like more work than calling.

### Marcus, barber and shop owner

- **Context:** 41, owns a 2-chair shop, cuts all day, uses a booking app his customers mostly ignore. Phone rings while he's cutting.
- **Goals:** a full book, fewer no-shows, no double-bookings, no extra admin.
- **Pains:** missed calls equal missed bookings; booking-app fees; customers who don't show.
- **What he needs:** listing in minutes, bookings landing in the tool he already uses, nothing to watch during the day.
- **What would make him leave:** one double-booking, or having to manage yet another inbox.

### Priya, agent developer

- **Context:** 29, builds agents for small businesses as a freelancer. Knows A2A.
- **Goals:** list her clients' agents, have them found and trusted, prove they behave.
- **Pains:** no directory where local-business agents get discovered; no way to show her agent is reliable.
- **What she needs:** a clear message contract, a test harness, a simple registration and verification flow, and visible reputation.

### Sam, operator and moderator

- **Context:** the maintainer at launch; later a part-time role.
- **Goals:** real listings only, fast response to reports, quiet on-call.
- **Pains:** fake listings, spam agents, unclear evidence when handling disputes.
- **What Sam needs:** an admin view of listings and reports, audit logs from both sides of a dispute, rate-limit and block controls.

## Journeys

### Dana: today

```mermaid
journey
    title Dana books a haircut today
    section Decide
      Remembers she needs a cut: 3: Dana
    section Find a time
      Calls the shop during work: 1: Dana
      No answer, Marcus is cutting: 1: Dana, Marcus
      Opens booking app, logs in again: 2: Dana
      Scrolls slots that don't fit: 2: Dana
    section Book
      Fills in the form on her phone: 2: Dana
      Gets a confirmation email: 4: Dana
```

### Dana: with Hitchpost (Phase 4)

```mermaid
journey
    title Dana books a haircut with Hitchpost
    section Ask
      Messages "cut Thursday after 5" in the app: 5: Dana
      Her agent asks Marcus's agent: 5: Dana
    section Decide
      Sees one offer, Thursday 5:30, $30: 5: Dana
      Taps approve: 5: Dana
    section Done
      Booking lands in Marcus's book: 5: Marcus
      Calendar entry and confirmation: 5: Dana
```

### Marcus: today vs with Hitchpost

```mermaid
flowchart LR
    subgraph Today
        A1[Phone rings mid-cut] --> A2[Missed call]
        A2 --> A3[Customer books elsewhere or not at all]
        A4[Booking app request] --> A5[Checks app between cuts]
    end
    subgraph With Hitchpost
        B1[Customer's agent asks] --> B2[Shop agent offers a free slot from his book]
        B2 --> B3{Customer approves?}
        B3 -- yes --> B4[Booking written to his tool]
        B3 -- no --> B5[Nothing changes]
        B4 --> B6[Both sides get a record]
    end
```

### Priya: onboarding a client's agent (Phase 3)

```mermaid
flowchart TD
    P1[Reads the message contract in 09 interfaces] --> P2[Runs the conformance tests locally]
    P2 --> P3[Publishes the Agent Card at the well-known URL]
    P3 --> P4[Registers the listing in the directory]
    P4 --> P5[Verification: domain or phone check for the business]
    P5 --> P6{Verified?}
    P6 -- no --> P7[Fixes and retries]
    P7 --> P5
    P6 -- yes --> P8[Listing goes live, searchable]
    P8 --> P9[Reputation builds from verified interactions]
```

## Supersedes and related

Supersedes "Who it is for" in [concept.md](../concept.md). Related: [01 vision and scope](01-vision-and-scope.md), [02 business case](02-business-case.md), [05 use cases](05-use-cases.md).
