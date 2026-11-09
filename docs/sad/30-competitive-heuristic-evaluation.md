# HP-SAD-30 · Competitive heuristic evaluation

| Field       | Value                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| Document ID | HP-SAD-30                                                              |
| Version     | 1.1                                                                    |
| Status      | Frozen for Phase 2 spike                                               |
| Date        | 2026-11-09                                                             |
| Owner       | Sanaullah Jannisar, product and engineering lead                       |
| Conforms to | Nielsen's 10 usability heuristics; ISO 9241-110 interaction principles |

## 1. Purpose and scope

This document evaluates the products Marcus and Dana already use, so that Hitchpost matches what they take for granted and competes only where there is a real gap. It covers Booksy, Square Appointments, Fresha, Vagaro, Google's booking surfaces (Reserve with Google, AI Mode agentic booking, "Ask for Me"), and agent access to these platforms.

It replaces the "to verify" competitor rows in [03 Business case](03-business-case.md) section 1 with observations that have a source and a date. Where this document and 03 disagree, this document is newer (section 8).

## 2. Method

### 2.1 Heuristics

Each rival is scored against Nielsen's 10 usability heuristics (H1 to H10) on the severity scale 0 to 4: 0 = no problem found, 1 = cosmetic, 2 = minor, 3 = major, 4 = catastrophic. A dash means the evidence didn't allow a rating.

| ID  | Heuristic                                              |
| --- | ------------------------------------------------------ |
| H1  | Visibility of system status                            |
| H2  | Match between system and the real world                |
| H3  | User control and freedom                               |
| H4  | Consistency and standards                              |
| H5  | Error prevention                                       |
| H6  | Recognition rather than recall                         |
| H7  | Flexibility and efficiency of use                      |
| H8  | Aesthetic and minimalist design                        |
| H9  | Help users recognise, diagnose and recover from errors |
| H10 | Help and documentation                                 |

Booking-specific heuristics, scored as a finding rather than a severity:

| ID  | Booking heuristic                                         |
| --- | --------------------------------------------------------- |
| B1  | Steps from finding a business to a confirmed booking      |
| B2  | Time to first available slot                              |
| B3  | Clarity of approval and confirmation                      |
| B4  | Ease of cancel and reschedule                             |
| B5  | Transparency of no-show and cancellation policy           |
| B6  | Trust signals (reviews, verification, payment protection) |
| B7  | Accessibility basics                                      |

### 2.2 Evaluator note and limits

- **One evaluator, desk-based.** I am the only evaluator, so this is not a multi-evaluator heuristic evaluation in Nielsen's sense. Expect it to miss problems a panel of 3 to 5 would catch.
- **Logged out, no bookings made.** Per the evaluation rules I set, I did not sign in, create accounts, submit forms or book anything. Flows are reconstructed from each vendor's own help centre and product pages, not from a timed live session.
- **Consequences.** B2 (time to first slot) and B7 (accessibility) are "not observed" for every rival: both need a live session with assistive technology. Severities rate documented behaviour, not pixels. Vendor marketing figures (for example, no-show reductions) are company-reported and unaudited.
- **Date.** Every source was viewed on 2026-11-09. Prices and features change; re-run this before any pricing decision.
- **Next step.** Before the A-01 test (see [03](03-business-case.md)), repeat B1 and B2 live on a phone with 3 participants, timed, including one screen-reader pass.

## 3. Customer booking flows

### 3.1 Booksy

Sources: [Booksy: how to book appointments](https://biz.booksy.com/blog/how-to-book-an-appointment), [Booksy help: reschedule](https://help.booksy.com/hc/en-us/articles/21616159780242-How-can-I-reschedule-an-appointment), [Booksy help: cancel](https://help.booksy.com/hc/en-us/articles/21616184097170-How-can-I-cancel-my-appointment), [Booksy help: provider cancels](https://help.booksy.com/hc/en-us/articles/21618073373330-What-should-I-do-if-a-service-provider-cancels-my-appointment). Viewed 2026-11-09.

1. Find the business through a Booksy link, the Booksy app or a search engine.
2. Pick a service, then a date and time.
3. Confirm details. A returning customer's details are saved; a new customer gives email and phone.
4. Review the booking, where reschedule and cancel are available.

- Rescheduling cancels the original appointment and books a new one, within the provider's window; fees may apply.
- Cancellation policy is on the provider profile ("Payment & Cancellation Policy") and in the confirmation email. Booksy support cannot cancel on a customer's behalf; outside the window, the customer contacts the provider.
- When a provider cancels, the customer is notified and offered "Book again".

### 3.2 Square Appointments

Sources: [Square Appointments pricing (US)](https://squareup.com/us/en/appointments/pricing), [Square Bookings API overview](https://developer.squareup.com/docs/bookings-api/what-it-is). Viewed 2026-11-09.

- Customers book on the seller's Square online booking site or through integrations (Reserve with Google is a common one).
- Cancellation policy and no-show fees are features of the paid Plus plan; deposits ("collect a partial deposit when appointments are scheduled") are listed without a tier.
- Step-by-step customer flow: not observed. Square's customer flow is the seller's booking site, which I didn't open without a specific seller.

### 3.3 Fresha

Sources: [Fresha help: how clients book online](https://www.fresha.com/help-center/knowledge-base/online-presence/101646-learn-how-clients-book-appointments-online), [Fresha for business](https://www.fresha.com/for-business). Viewed 2026-11-09.

1. Find the business on the Fresha marketplace (app or web), a Facebook or Instagram "Book Now" button, Reserve with Google, or a direct link.
2. Browse services and real-time availability (no sign-in needed to browse).
3. Pick a date and time; review services, team member, price, and add a note.
4. Give card details or pay upfront if the business requires it.
5. Sign in or create a Fresha client account (required to confirm).
6. Confirm; a notification with booking details follows.

- Cancel and reschedule are self-serve outside the business's window. A booking with an upfront payment can be rescheduled online but not cancelled online; the client must contact the business.

### 3.4 Vagaro

Sources: [Vagaro: cancel or reschedule (customers)](https://support.vagaro.com/hc/en-us/articles/4852515855643-Cancel-or-Reschedule-Services-and-Classes-for-Customers-of-a-Vagaro-Business), [Vagaro: rebook (customers)](https://support.vagaro.com/hc/en-us/articles/360008506194-Rebook-a-Service-or-Class-for-Customers-of-a-Vagaro-Business). Viewed 2026-11-09.

- First-time booking steps: not observed (no customer-facing walkthrough found).
- Reschedule: Appointments, then Upcoming, then Reschedule, in the app or on vagaro.com; the business calendar updates automatically.
- Cancel: from the Upcoming tab's More menu. Depending on the business, a prompt warns of a non-refundable deposit or a cancellation fee charged to the card.
- If the business disables online changes, a popup shows the business's phone number.
- Rebook: Past tab, then Rebook; needs a signed-in customer account.

### 3.5 Google

Sources: [Google blog: Reserve with Google](https://blog.google/products-and-platforms/products/maps/reserve-google-summer-bookin-happens-so-fast/), [Booksy: Google AI Mode integration](https://biz.booksy.com/en-us/blog/booksy-google-ai-mode-integration), [Tom's Guide: AI Mode books salon appointments](https://www.tomsguide.com/ai/googles-ai-mode-now-books-your-event-tickets-and-beauty-appointments-for-you), [Search Engine Land: Ask for Me](https://searchengineland.com/google-search-launches-ask-for-me-451346). Viewed 2026-11-09.

- **Reserve with Google:** a "Book" button on Search and Maps listings, fulfilled by a connected booking provider (Booksy, Square, Fresha and others). Google doesn't hold the calendar.
- **AI Mode agentic booking:** announced by Google in August 2025 and expanded to local appointments in November 2025, with Booksy as a launch partner (Booksy, 2025-11-20). Booksy says the assistant books "directly into the provider's calendar", "entirely through a conversational flow", with bookings "instantly confirmed". Coverage says it began in Search Labs in the US for AI Pro and Ultra subscribers. Current availability: not observed.
- **"Ask for Me":** a Search Labs experiment in which Google's AI phones local businesses (built on Duplex) to check prices and availability, initially for nail salons and auto shops. It discloses that it is an AI. Businesses can opt out.

### 3.6 Agent access to rival platforms

| Platform  | Agent or API access as published                                                                                                                                                                                                                | Source                                                                                                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fresha    | Public MCP server serving real-time availability to ChatGPT and Claude, launched August 2026. The booking completes on Fresha's own checkout, not in the assistant.                                                                             | [CX Network, 2026-09-09](https://www.cxnetwork.com/cx-experience/articles/fresha-goes-conversational-with-native-claude-and-chatgpt-integration-for-beauty-bookings), [Business Wire](https://www.businesswire.com/news/home/20260804452505/en/) |
| Booksy    | Google AI Mode partner. The Public API is partner-gated: the docs return HTTP 401 to the public and registration means contacting Booksy. No official MCP server observed.                                                                      | [Booksy](https://biz.booksy.com/en-us/blog/booksy-google-ai-mode-integration), [apis.io](https://apis.io/apis/booksy/booksy-public-api/)                                                                                                         |
| Square    | Public Bookings API. Buyer-level scope (all sellers) can search availability and create, update and cancel the app's own bookings, but can't double-book or book outside business hours. Seller-level writes need Appointments Plus or Premium. | [Square developer docs](https://developer.squareup.com/docs/bookings-api/what-it-is)                                                                                                                                                             |
| Vagaro    | Enterprise API with appointments endpoints; access is requested inside a business account and manually reviewed. One third party reports it's blocked for trial accounts and merchants not on Vagaro processing.                                | [apis.io](https://apis.io/providers/vagaro/), [Supergood](https://supergood.ai/api-report-card/vagaro) (third party, unverified)                                                                                                                 |
| Any rival | A2A endpoint: not observed for any of them.                                                                                                                                                                                                     | Searches on 2026-11-09                                                                                                                                                                                                                           |

## 4. Heuristic scorecards

These severities rate documented behaviour, not a timed live session (section 2.2).

| Heuristic                     | Booksy | Square | Fresha | Vagaro | Google AI Mode |
| ----------------------------- | ------ | ------ | ------ | ------ | -------------- |
| H1 Visibility of status       | 1      | –      | 1      | 1      | 2              |
| H2 Real-world match           | 0      | –      | 0      | 0      | 1              |
| H3 User control and freedom   | 2      | –      | 2      | 1      | –              |
| H4 Consistency                | 2      | –      | 1      | 1      | –              |
| H5 Error prevention           | 1      | –      | 1      | 1      | 2              |
| H6 Recognition over recall    | 1      | –      | 1      | 1      | 1              |
| H7 Flexibility and efficiency | 0      | –      | 2      | 1      | 0              |
| H8 Minimalist design          | –      | –      | –      | –      | –              |
| H9 Error recovery             | 2      | –      | 2      | 1      | –              |
| H10 Help and documentation    | 1      | 2      | 1      | 1      | 3              |

What drives each score:

- **Booksy.** H3 and H9 = 2: support can't cancel for the customer, so outside the window the customer has to reach the provider. H4 = 2: "reschedule" actually cancels and rebooks, which can surprise customers when fees apply. H7 = 0: saved details make repeat booking fast.
- **Square.** H10 = 2: US plan prices aren't shown in the pricing page text I could read. Customer flow: not observed.
- **Fresha.** H7 = 2: an account is required to confirm, which adds a step for new customers (browsing works signed out). H3 and H9 = 2: a prepaid booking can't be cancelled online.
- **Vagaro.** Its documented recovery is good: when online changes are off it shows the business's phone number. H9 = 1.
- **Google AI Mode.** H1 and H5 = 2: "instantly confirmed" bookings made inside a conversation give little documented room to check the details before committing. H10 = 3: there is almost no public documentation of confirmation, cancellation or policy handling. H7 = 0: one conversation, no app.

Booking heuristics:

|                          | Booksy                                               | Square                        | Fresha                                                  | Vagaro                                | Google AI Mode                                    |
| ------------------------ | ---------------------------------------------------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------- | ------------------------------------------------- |
| B1 Steps to book         | 4 (returning user: fewer)                            | Not observed                  | 6 incl. sign-in                                         | Not observed                          | Conversational, step count not observed           |
| B2 Time to first slot    | Not observed                                         | Not observed                  | Not observed                                            | Not observed                          | Not observed                                      |
| B3 Confirmation clarity  | Review screen and email                              | Not observed                  | Review screen and notification                          | Not observed                          | "Instantly confirmed"; review step not documented |
| B4 Cancel and reschedule | Self-serve in window; reschedule = cancel and rebook | Not observed                  | Self-serve in window; prepaid can't cancel online       | Self-serve; phone shown when disabled | Not documented                                    |
| B5 Policy transparency   | Profile section and confirmation email               | Plus feature                  | Window enforced; deposit shown                          | Fee prompt at cancel                  | Not documented                                    |
| B6 Trust signals         | Marketplace reviews, no-show protection              | Seller brand, card processing | Marketplace reviews, verified client accounts, deposits | Fee and deposit prompts               | Google brand; partner platform                    |
| B7 Accessibility         | Not observed                                         | Not observed                  | Not observed                                            | Not observed                          | Not observed                                      |

## 5. Barber-side value and pricing as published

All prices are as published on 2026-11-09, US unless stated.

| Rival                  | Price                                                                                                                                                                                                        | What the barber is sold                                                                                                                          | Source                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Booksy                 | $29.99 per month plus $20 per extra user; 14-day trial. "Boost" marketplace clients: 30% of a new client's first visit, capped at $100. Processing 2.49% to 2.69% plus fees.                                 | Unlimited bookings, reminders, 2,000 SMS per month, no-show protection, Reserve with Google, waitlists, free marketplace listing                 | [biz.booksy.com/en-us/pricing](https://biz.booksy.com/en-us/pricing)                                                         |
| Square Appointments    | Free tier for solo sellers. Plus and Premium priced per location; the US amounts aren't shown in the page text I could read (Square's Canadian page lists Plus at CA$35 and Premium at CA$85 per month).     | Free: online booking site, reminders, unlimited staff calendars. Plus: cancellation policy and no-show fees, waitlist.                           | [US pricing](https://squareup.com/us/en/appointments/pricing), [CA pricing](https://squareup.com/ca/en/appointments/pricing) |
| Fresha                 | $19.95 per month for one bookable member, or $14.95 per member; 7-day trial. Marketplace new clients: 20% one-time, minimum $6; returning clients and direct links free. Online processing 2.79% plus $0.20. | "25+ million customers looking to book", deposits ("89% fewer no-shows", company-reported), reminders, AI concierge, ChatGPT and Claude bookings | [fresha.com/pricing](https://www.fresha.com/pricing), [fresha.com/for-business](https://www.fresha.com/for-business)         |
| Vagaro                 | $30 per month ($23.99 for the first 6 months), plus $10 per bookable calendar up to 7; 30-day trial. Free marketplace listing.                                                                               | All-in-one booking, payments, marketplace                                                                                                        | [vagaro.com/pro/pricing](https://www.vagaro.com/pro/pricing)                                                                 |
| Google                 | Free for the customer. Fees, if any, sit with the booking provider.                                                                                                                                          | Distribution from Search and Maps                                                                                                                | Section 3.5                                                                                                                  |
| Hitchpost (hypothesis) | $1 per honored booking, capped at $39 per month, first 3 months free                                                                                                                                         | Bookings from other people's agents, a shared approval record, verified-interaction ratings                                                      | [03](03-business-case.md)                                                                                                    |

The pattern that matters: every rival either bundles bookings into a flat subscription or charges only for **new** clients (Booksy Boost 30%, Fresha 20%). Returning clients are free everywhere. A per-booking fee that includes Marcus's regulars is out of line with the market.

## 6. Feature comparison

Hitchpost status uses the phase map in [00 section 10](00-document-control.md#10-normative-parameters-and-phase-map).

| Capability                                    | Booksy             | Square             | Fresha                         | Vagaro          | Google                  | Hitchpost                      |
| --------------------------------------------- | ------------------ | ------------------ | ------------------------------ | --------------- | ----------------------- | ------------------------------ |
| Online booking for customers                  | Yes                | Yes                | Yes                            | Yes             | Through providers       | Phase 2 (agent), Phase 4 (app) |
| Consumer marketplace or discovery             | Yes                | No                 | Yes                            | Yes             | Search and Maps         | Phase 3 directory              |
| Reminders (SMS or email)                      | Yes                | Yes                | Yes                            | Yes             | Provider                | Not planned                    |
| Deposits and no-show fees                     | Yes                | Plus               | Yes                            | Yes             | Provider                | Later (not in v1)              |
| Self-serve cancel and reschedule              | Yes                | Not observed       | Yes                            | Yes             | Not documented          | Phase 2                        |
| Waitlist                                      | Yes                | Plus               | Not observed                   | Not observed    | No                      | Not planned                    |
| Reserve with Google                           | Yes                | Yes                | Yes                            | Not observed    | n/a                     | Not planned                    |
| Assistant booking (ChatGPT, Claude, Gemini)   | Via Google AI Mode | Not observed       | MCP server; checkout on Fresha | Not observed    | AI Mode books directly  | Any A2A agent, Phase 2         |
| Public API                                    | Partner-gated      | Yes (Bookings API) | MCP server                     | Gated, reviewed | Partner program         | Open A2A contract, Phase 2     |
| A2A endpoint                                  | Not observed       | Not observed       | Not observed                   | Not observed    | Not observed            | Built (availability)           |
| Neutral across platforms                      | No                 | No                 | No                             | No              | Partly (many providers) | Design goal, Phase 3           |
| Human approval on both sides, logged for both | No                 | No                 | No                             | No              | Not documented          | Phase 2                        |
| Ratings from verified interactions            | Reviews            | No                 | Reviews                        | Reviews         | Google reviews          | Phase 5                        |

## 7. Table stakes and real gaps

### 7.1 Table stakes Hitchpost must match or avoid competing on

1. **No-show protection.** Every rival sells deposits or no-show fees. Hitchpost has none in v1, so it shouldn't try to replace a barber's booking tool. It should sit in front of one: via MCP connector C1 in [17 Transition plan](17-transition-plan.md), offers come from the tool and the tool keeps the deposits.
2. **Reminders.** Everyone sends them, and Hitchpost doesn't plan to. In the pilot, the barber's existing tool must keep sending them. That makes C3 (the hosted book, no reminders) a weaker pilot option.
3. **Self-serve cancel and reschedule within a policy window.** This is the norm, and Hitchpost's Phase 2 plan with P-10 matches it.
4. **A fast repeat booking.** Booksy saves details and Google AI Mode books in one conversation. Dana's baseline is an app she already has, not a phone call.
5. **Visible policy before booking.** Rivals show the cancellation policy on the profile and at checkout. Hitchpost's approval screen must show it before the yes.

### 7.2 Gaps Hitchpost can exploit

1. **Neutrality.** Each rival's agent access ends in its own silo: Fresha's MCP hands off to Fresha checkout, and Booksy's AI booking runs through Google. Nobody offers one directory that any agent can reach across platforms, including shops on no platform at all.
2. **Shops with no platform.** "Ask for Me" exists because many small shops only answer the phone. For them, a free hosted agent is the only option besides Google phoning them.
3. **A consent record both sides can check.** No rival documents a logged, two-sided approval. Google AI Mode "instantly confirms" inside a conversation, and its public documentation of what the user checks first is thin. Fresha's own executive is quoted saying "convenience does not automatically produce consent". Hitchpost's approval gate answers that concern directly.
4. **An open protocol.** No rival exposes A2A. Square's buyer-level Bookings API is open and enough for an MCP connector, which makes Square the most realistic first integration for A-03.
5. **Pricing.** Superseded in round 5: nobody pays, because Hitchpost is an open protocol with a free reference implementation for now. The market pattern still stands as context for any future decision: rivals either bundle bookings into a flat subscription or charge only for net-new clients (Booksy Boost 30%, Fresha 20%, minimum $6), never for returning clients.

### 7.3 Threats

| Threat                                                                                      | Evidence                                                            | Likelihood | Response                                                                                                        |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| Google AI Mode becomes the default consumer agent and books directly into Booksy and others | Live since November 2025 with Booksy (section 3.5)                  | High       | Don't compete on the consumer assistant; make Hitchpost listings reachable by any assistant, Google's included. |
| Fresha or Booksy add A2A next to MCP                                                        | Fresha already runs a public MCP server; adding A2A is a small step | Medium     | Neutrality and shops outside the platforms are the moat, not the protocol.                                      |
| Platforms restrict API access to block neutral aggregators                                  | Booksy and Vagaro gate their APIs today                             | Medium     | Start with Square's public API; keep C2 (calendar sync) as a fallback.                                          |
| Customers see no reason to switch from an app that books in about 30 seconds                | Saved details, one-tap rebooking (Booksy, Vagaro)                   | High       | Target the cases those apps don't cover: shops not on your app, and booking several shops from one agent.       |

## 8. Implications for other documents

| Document                                                | Change this evaluation implies                                                                                                                                                                                                                                                                                                                                                                                   | Status                          |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| [03 Business case](03-business-case.md) section 1       | **Contradiction.** 03 says platforms "could ship an A2A endpoint" and marks Google "to verify". In fact Fresha already ships agent access (MCP, August 2026), and Google AI Mode already books Booksy appointments conversationally (November 2025). The "what's left open" claim still holds on neutrality and a two-sided approval record, but it must cite this document and drop "to verify" for these rows. | Open: owner to update 03        |
| 03 pricing hypothesis                                   | Superseded in round 5: no pricing; 03 is an adoption case. If monetization is ever considered (Later, undecided), the market never charges for returning clients.                                                                                                                                                                                                                                                | Open: owner decision            |
| [14 User interface design](14-user-interface-design.md) | The approval screen must show the shop's cancellation policy before the yes (table stakes 5). The A-01 baseline is booking in an existing app, not a phone call.                                                                                                                                                                                                                                                 | Open                            |
| PRD MoSCoW (HP-SAD-24)                                  | Must: show policy before approval; offers from the shop's existing tool via a connector (deposits and reminders stay there). Should: Square Bookings API connector first. Won't (v1): own deposits, reminders, waitlist.                                                                                                                                                                                         | To include when 24 is baselined |
| [17 Transition plan](17-transition-plan.md)             | Prefer C1 with Square for pilot shops; C3 lacks reminders and no-show protection.                                                                                                                                                                                                                                                                                                                                | Open                            |
| Sales objection handling                                | "My customers already book in 30 seconds on Booksy." Answer: keep Booksy. Hitchpost adds bookings from people whose assistant isn't Booksy's, charges only for those new clients, and records consent on both sides.                                                                                                                                                                                             | For the sales playbook          |

## Revision history

| Version | Date       | Change                                                                                                                                    | Author      |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline: desk-based heuristic evaluation of Booksy, Square Appointments, Fresha, Vagaro and Google, with sources viewed 2026-11-09 | S. Jannisar |
| 1.1     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike                             | S. Jannisar |
