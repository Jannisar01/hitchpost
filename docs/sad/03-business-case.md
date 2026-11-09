# HP-SAD-03 · Business case

| Field       | Value                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Document ID | HP-SAD-03                                                                                                                            |
| Version     | 1.1                                                                                                                                  |
| Status      | Baselined for Phase 2                                                                                                                |
| Date        | 2026-11-09                                                                                                                           |
| Owner       | Sanaullah Jannisar, product and engineering lead                                                                                     |
| Conforms to | ISO/IEC/IEEE 29148:2018 (business requirements: business environment, model, risks); ISO/IEC/IEEE 15288 business or mission analysis |

The case for building Hitchpost, what has to be true for it to work, and how I'll find out cheaply before building too far.

## 1. Market and competition

Every claim below is marked **to verify (2026-11-08)** until I've checked it against a primary source and added a link. I won't cite any of them outside this repo until they're verified.

### Protocols (the layer I build on, not compete with)

| Player                                                                          | What it does                                                                           | Relevance                                                        | Check                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| A2A (Agent2Agent), Linux Foundation project, JS SDK v1.3 implementing spec v1.0 | Agent-to-agent messaging; Agent Cards at a well-known URL; card signatures in the spec | My wire protocol. SDK version confirmed in this repo's lockfile. | Partly verified (SDK); governance to verify |
| MCP (Model Context Protocol)                                                    | Agent-to-tool connections                                                              | How agents will reach booking systems (Phase 6)                  | To verify (2026-11-08)                      |

### Registries and directories (closest to my directory)

| Player                                                                                    | What it is                                           | Gap I see                                                                | Check                  |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------- |
| Official MCP Registry                                                                     | Registry of MCP servers (tools), aimed at developers | Lists tools, not businesses; no reputation                               | To verify (2026-11-08) |
| AGNTCY Agent Directory                                                                    | Open agent directory effort                          | Developer infrastructure, not a consumer phone book for local businesses | To verify (2026-11-08) |
| MIT NANDA index                                                                           | Research index of agents                             | Research, not consumer-facing                                            | To verify (2026-11-08) |
| Vendor agent marketplaces (e.g. Google Cloud agent marketplace, Salesforce AgentExchange) | Enterprise agent catalogs                            | Enterprise buyers, not local services                                    | To verify (2026-11-08) |

### Agent commerce and approval

| Player                                             | What it is                                           | Overlap                                                    | Check                  |
| -------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ---------------------- |
| AP2 (Agent Payments Protocol), "mandates"          | Proof that a user authorized an agent purchase       | Overlaps my approval gate for payments                     | To verify (2026-11-08) |
| ACP (Agentic Commerce Protocol, OpenAI and Stripe) | Checkout initiated by agents                         | Overlaps if I add payments                                 | To verify (2026-11-08) |
| Consumer agents (ChatGPT agent, Gemini)            | Book and buy on the user's behalf, with confirmation | Already ask before acting, so the gate alone is not unique | To verify (2026-11-08) |

### Booking platforms (the real competition for barbers)

| Player                                                      | Position                                                         | Threat                                                       | Check                  |
| ----------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------- |
| Booksy, Square Appointments, Fresha, Vagaro, Squire, Acuity | Own the barber's calendar, consumer app and reviews              | Could ship an A2A endpoint themselves, inside their own silo | To verify (2026-11-08) |
| Google (Reserve with Google, "Ask for me", Duplex)          | Books local businesses from Search and Maps; can call businesses | Distribution I can't match                                   | To verify (2026-11-08) |

### What's left open

Nobody I've found so far offers all three of these for small local businesses: a neutral, cross-platform directory of business agents; reputation built from verified agent interactions; and an approval record both sides can check. That's my position, and it stays a hypothesis until the scan is verified (A-07).

## 2. Business model

### Options

| Option                           | Who pays                  | For what                                      | Pros                                                       | Cons                                                              |
| -------------------------------- | ------------------------- | --------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------- |
| A. Business subscription         | Barber                    | Verified listing, agent hosting, booking sync | Predictable; matches how barbers already pay booking tools | Hard sell before there's demand                                   |
| B. Per-booking fee               | Barber                    | Each honored booking                          | Pays only for results; easy first yes                      | Revenue tied to slow early volume                                 |
| C. Consumer subscription         | Person                    | Personal agent and app                        | Clear value if the app is great                            | Consumer subscriptions are hard; competes with general assistants |
| D. Open core plus hosted service | Businesses and developers | Hosted directory, verification, SLA           | Fits MIT and open protocol                                 | Needs scale to matter                                             |

**My choice for v1:** B, a per-booking fee with a monthly cap, so a shop pays only for results and never more than a small, predictable amount. A (subscription) is not offered in v1; I revisit it only if the cap is hit by most paying shops. D is the long-term shape. C is off the table for v1, because the built-in personal agent is how I solve cold start, not a product to charge for.

### Price hypothesis (to test, not to announce)

One hypothesis, used everywhere in this package, including the revenue model in [02 Feasibility study](02-feasibility-study.md):

- **$1 per honored booking**, where honored means the booking reached Completed (the customer showed up).
- **Capped at $39 per shop per month.**
- **First 3 months free** for every shop, including the pilot shops.
- **Anchor:** barbers already pay booking platforms roughly $30 to $100+ per month (to verify, 2026-11-08). At 25 to 35 honored bookings a month a shop pays $25 to $35, below that anchor, because Hitchpost adds to their stack rather than replacing it.
- **Tested in** the A-02 interviews (would you pay this?) and A-05 (does any barber accept any price?).

### Cost drivers

| Driver                                                | Phase | Notes                                                                                     |
| ----------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------- |
| Hosting (directory, hosted business agents, database) | 6     | Small at one neighborhood; scales with listings and messages                              |
| Verification (phone or SMS checks, domain checks)     | 3     | Per-listing cost                                                                          |
| Language-model calls                                  | Later | Only on the person's side, to turn words into a request; never per agent-to-agent message |
| Booking platform API access                           | 6     | Unknown; some platforms may charge or restrict (A-03)                                     |
| Moderation time                                       | 5     | Mine at first; the biggest hidden cost if abuse grows                                     |

## 3. Assumptions and how I'll test them

Each assumption gets the cheapest test that could prove it wrong, and a kill or pivot criterion decided **before** the test runs.

| ID       | Assumption                                                                                           | Cheapest test                                                                                                                                                                                                                              | Kill or pivot if                                                                                                      | Before                                               |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **A-01** | People will book through an agent and approve offers, instead of tapping a booking app or calling    | Wizard-of-Oz for **8 weeks** over WhatsApp with about 15 people: I act as their agent and as the barber's. Eight weeks covers at least two booking cycles for someone who books every 3 to 4 weeks ([04](04-stakeholders-and-personas.md)) | Fewer than 60% complete one booking through the agent, fewer than 30% complete two, or first-offer approval under 50% | M-01, before Phase 2 build beyond protocol-safe work |
| **A-02** | Barbers will list their shop and act on bookings that arrive this way                                | Interview 10 local barbers: tool, pains, would they list, would they pay                                                                                                                                                                   | Fewer than 3 of 10 would list for free                                                                                | Phase 3 starts                                       |
| **A-03** | Barbers' booking tools allow programmatic reads and writes                                           | Desk audit of public APIs and terms for the tools barbers named in A-02                                                                                                                                                                    | None of the top 3 tools allows writes. Pivot: Hitchpost hosts the calendar, or use calendar sync                      | Phase 3 starts                                       |
| **A-04** | Agent booking is faster for the person than today                                                    | Time-to-book baseline on me plus 5 people, then the same with the Wizard-of-Oz flow                                                                                                                                                        | Not at least 50% faster end to end                                                                                    | M-01                                                 |
| **A-05** | A neutral directory is defensible and someone will pay for it                                        | Verified competitor scan, plus the price question (section 2) in the A-02 interviews                                                                                                                                                       | A booking platform already offers cross-platform agent booking, or no barber accepts any price                        | M-02, before Phase 3 starts                          |
| **A-06** | People trust reviews from verified interactions more than ordinary reviews                           | 5 short interviews showing two listing mockups                                                                                                                                                                                             | No preference                                                                                                         | Phase 5 starts                                       |
| **A-07** | Nobody offers directory, verified reputation and a two-sided approval record for local businesses    | Verify every row in section 1 with primary sources and dates                                                                                                                                                                               | A live product covers all three                                                                                       | Phase 3 starts                                       |
| **A-08** | The built-in personal agent is enough on the consumer side at launch, without third-party assistants | Measure in the A-01 test whether people care which assistant they use                                                                                                                                                                      | Most people refuse a new app                                                                                          | Phase 4 starts                                       |

The three riskiest are **A-01**, **A-02 with A-03**, and **A-05**: the audit's three. None of them needs code to test.

## 4. Risks

Likelihood and impact on a 1 to 3 scale. Owner is me unless noted.

| ID   | Risk                                                                                                      | L   | I   | Mitigation                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------- | --- | --- | ----------------------------------------------------------------------------------------------------------------------- |
| R-01 | People don't adopt agent booking (A-01 fails)                                                             | 2   | 3   | 8-week test before Phase 2 build beyond protocol-safe work (M-01); kill criteria above                                  |
| R-02 | Booking platforms ship their own agent endpoints and keep it inside their silo                            | 3   | 3   | Be neutral and cross-platform; portable listings; partner rather than fight                                             |
| R-03 | Booking tools block API access or forbid automation in their terms                                        | 2   | 3   | A-03 desk audit; fallback to calendar sync or a Hitchpost-hosted calendar                                               |
| R-04 | Prompt injection or hostile agents trick an agent into acting                                             | 2   | 3   | Typed messages, strict validation, approval gate, no actions from free text ([12 security](12-security-and-privacy.md)) |
| R-05 | Fake or impersonated business agents                                                                      | 2   | 3   | Verified listings, signed Agent Cards, reporting (UC-09)                                                                |
| R-06 | Spam and hold exhaustion: agents messaging at machine speed or locking chairs with offers they never take | 3   | 2   | Open-holds cap (P-07) and per-IP rate limit (P-08) from Phase 2; per-identity limits and sender reputation from Phase 6 |
| R-07 | Liability for wrong bookings                                                                              | 2   | 2   | Approval and audit log on both sides; clear terms                                                                       |
| R-08 | Privacy breach of calendar or contact data                                                                | 1   | 3   | Share minimum; retention limits; export and delete                                                                      |
| R-09 | Regulation once deposits or payments appear (card data, consumer protection)                              | 2   | 2   | No payments in v1; use a payment provider and AP2 or ACP later                                                          |
| R-10 | A2A changes in breaking ways                                                                              | 2   | 2   | Track the spec; SDK compatibility layer; contract tests                                                                 |
| R-11 | Solo maintainer bandwidth (moderation, support, ops)                                                      | 3   | 2   | One neighborhood; automate checks; recruit contributors through open source                                             |
| R-12 | Cold start: empty directory and no consumer agents speaking A2A                                           | 3   | 3   | Built-in personal agent (A-08), seeded neighborhood, nearly free listing                                                |

## 5. Go-to-market: one neighborhood

1. **Pick one area** with at least 15 barbershops within walking distance, where I can visit in person.
2. **Recruit from the A-02 interviews.** I offer free listing and setup for the first 10 shops, done by me in under 15 minutes per shop.
3. **Seed demand** with the A-01 participants, then their friends. Target 50 people who've booked at least once.
4. **Show it working in the shop:** a QR code at the counter saying "Book next time by message", which opens the client app.
5. **Measure weekly:** north star, counter-metrics, listing time, reports.
6. **Decide at 12 weeks:** expand to the next neighborhood, change the vertical, or stop. The criteria are the kill rules in section 3 and the v1 release criteria in [01](01-vision-and-scope.md). Each further neighbourhood gets the same 12-week rule; the shop counts in [02](02-feasibility-study.md) section 4.2 assume two such expansions and drop out if a step fails.

## Supersedes and related

Supersedes sections 1, 3, 4, 6 and 9 of [insights.md](../insights.md). Related: [01 vision and scope](01-vision-and-scope.md), [04 stakeholders and personas](04-stakeholders-and-personas.md), [Phase 1 audit](../audits/2026-11-08-phase-1.md).

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                    | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0.1     | 2026-11-08 | First draft                                                                                                                                                                                                                                                                                                               | S. Jannisar |
| 1.0     | 2026-11-09 | Baselined: renumbered into lifecycle order, formal document control, standards conformance                                                                                                                                                                                                                                | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: one pricing hypothesis ($1 per honored booking, $39 cap, 3 months free), model B chosen for v1; A-01 redesigned to 8 weeks with a one-booking and two-booking pass rule; A-05 moved to M-02; R-06 covers hold exhaustion with P-07 and P-08; expansion rule tied to the 02 scenario | S. Jannisar |
