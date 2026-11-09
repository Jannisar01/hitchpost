# 05. Use cases

Step-by-step flows for each use case in the [index](README.md#use-case-list). UC-01 describes the system as built; the rest describe the design for their phase. Requirement IDs refer to [04. Requirements](04-requirements.md).

Actors: **Dana** (customer), **Dana's agent**, **Marcus** (barber), **Marcus's agent** (barber agent), **Priya** (agent developer), **Sam** (operator), **Directory**.

---

## UC-01. Ask a business agent for availability

**Phase 1, Built.** Code: `askForSlot` in `packages/my-agent/src/ask.ts`, `BarberExecutor` in `packages/barber-agent/src/executor.ts`.

- **Actors:** Dana, Dana's agent, Marcus's agent.
- **Preconditions:** Dana's agent knows the barber agent's URL. The barber agent is running with an appointment book.
- **Trigger:** Dana asks for a service in a time window (today through the CLI: service, earliest, latest).
- **Postconditions:** Dana sees a validated offer, "no slots" or a rejection. Nothing is booked.
- **Related:** FR-MSG-01 to FR-MSG-08, FR-BOOK-04, NFR-SEC-01, NFR-SEC-05.

**Main flow**

1. Dana's agent validates its own request (service, strict ISO times, window up to 31 days).
2. It fetches the barber agent's card from `/.well-known/agent-card.json` (no redirects, one deadline for the whole exchange).
3. It sends the `availability_request` as an A2A data part over JSON-RPC.
4. The barber agent validates and rebuilds the request.
5. It finds the first free slot in the window that fits opening hours, overlaps no booking and is not in the past.
6. It replies with an `offer` message.
7. Dana's agent validates the reply and checks the offer matches the request (same service, start inside the window).
8. Dana sees the offer and the note that nothing is booked until she approves.

**Alternate and exception flows**

- **1a.** Dana's request is invalid: her agent refuses to send it and says the service or dates aren't valid.
- **2a.** The card can't be fetched, redirects, or the agent doesn't answer before the deadline (10 s): Dana sees "Couldn't get an answer from that agent."
- **4a.** The request is invalid or not a data part (for example free text): the barber agent replies `rejected`.
- **5a.** No slot fits: the barber agent replies `no_availability`.
- **7a.** The reply is malformed, contains control characters, or the offer doesn't match the request: Dana's agent refuses it with a plain message of its own. Remote text is never shown.
- **7b.** The barber agent answers with a Task instead of a Message: Dana's agent reports the task state.

```mermaid
sequenceDiagram
    actor Dana
    participant DA as Dana's agent
    participant BA as Barber agent
    participant Book as Appointment book

    Dana->>DA: haircut, Thu 17:00 to 19:00
    DA->>DA: validate own request
    DA->>BA: GET /.well-known/agent-card.json
    BA-->>DA: agent card
    DA->>BA: SendMessage(availability_request)
    BA->>BA: parseAvailabilityRequest
    alt invalid
        BA-->>DA: rejected
    else valid
        BA->>Book: findFreeSlot(window, now)
        alt slot found
            BA-->>DA: offer(offerId, 17:30, 30 min, 30.00 USD)
        else none
            BA-->>DA: no_availability
        end
    end
    DA->>DA: parseBarberReply + offerMatches
    DA-->>Dana: Offer, or a plain refusal
```

---

## UC-02. Approve an offer and book it

**Phase 2.**

- **Actors:** Dana, Dana's agent, Marcus's agent.
- **Preconditions:** UC-01 produced a validated, matching offer. The barber agent stored it and is holding the slot until it expires.
- **Trigger:** Dana approves the offer.
- **Postconditions:** the slot is booked in Marcus's book; both audit logs record offer, approval, request and confirmation; Dana's calendar has the appointment.
- **Related:** FR-GATE-01 to FR-GATE-05, FR-BOOK-01, FR-BOOK-02, FR-APP-02, NFR-REL-02.

**Main flow**

1. Dana's agent shows the offer using only validated fields, including when it expires (`expiresAt`).
2. Dana approves. The approval gate creates an `Approval` bound to this `offerId` and `contextId` (only the gate can create one) and logs it.
3. Her agent sends a `booking_request` (contract `hitchpost/1`) with the `offerId` in the same A2A context. The booking function only accepts an `Approval`.
4. The barber agent opens an A2A Task and checks in one atomic step: the offer exists, is unexpired, belongs to this context, and the slot is still free. By default the shop's opening hours count as Marcus's standing approval.
5. It writes the booking to the book, logs it, and completes the Task with `booking_confirmed`.
6. Dana's agent validates the confirmation, checks it matches the approved offer field for field, logs it, and adds the appointment to Dana's calendar.
7. Dana sees "Booked."

**Alternate and exception flows**

- **2a.** The offer expired before Dana approved: her agent says so and offers to ask again (back to UC-01).
- **4a.** The offer is unknown, expired, from another context, or the slot was taken: the Task ends `REJECTED` with `booking_rejected` (`unknown_offer`, `expired`, `slot_taken` or `other`); nothing is written.
- **4b.** Marcus has switched his shop to manual approval (FR-GATE-05, open Phase 2 decision): the Task waits in input-required state, then completes after Marcus approves, or ends `booking_rejected` after he declines or it times out.
- **6a.** The confirmation doesn't match the approved offer: Dana's agent treats it as a failure, logs it and tells Dana to contact the shop.
- **3a / 6b.** Network failure after sending: Dana's agent retries with the same `offerId`; the barber agent returns the same booking for an already-confirmed offer, not a new one.

```mermaid
sequenceDiagram
    actor Dana
    participant DA as Dana's agent
    participant Gate as Approval gate
    participant BA as Barber agent
    participant Book as Appointment book

    DA-->>Dana: Offer: Thu 17:30, 30.00 USD
    Dana->>Gate: Approve
    Gate->>Gate: create Approval(offerId, contextId), log
    Gate->>DA: Approval
    DA->>BA: booking_request(offerId), opens Task
    BA->>BA: offer exists, unexpired, same context?
    opt shop set to manual approval
        BA-->>DA: Task input-required
        Note over BA: waits for Marcus
    end
    BA->>Book: slot still free? write booking
    alt all checks pass
        BA-->>DA: Task COMPLETED: booking_confirmed
        DA->>DA: validate, match approved offer, log
        DA-->>Dana: Booked
    else any check fails
        BA-->>DA: Task REJECTED: booking_rejected(reason)
        DA-->>Dana: Not booked, with reason
    end
```

---

## UC-03. Decline an offer or ask for another

**Phase 2.**

- **Actors:** Dana, Dana's agent, Marcus's agent.
- **Preconditions:** Dana has a validated offer (UC-01).
- **Trigger:** Dana declines, or asks for something different.
- **Postconditions:** nothing is booked; Dana's agent logs the decline; the barber agent logs the offer as expired and releases the hold at `expiresAt`.
- **Related:** FR-GATE-01, FR-GATE-03, FR-BOOK-01.

The `hitchpost/1` contract has no decline message: an unused offer simply expires. That keeps the contract small; a `decline` kind can be added later if early release of held slots matters to shops.

**Main flow**

1. Dana declines the offer.
2. Her agent logs the decline. Nothing is sent.
3. At `expiresAt` the barber agent releases the hold and logs the offer as expired.
4. If Dana gave a new preference ("anything later?"), her agent sends a new `availability_request` with the adjusted window (back to UC-01).

**Alternate flows**

- **1a.** Dana ignores the offer: same as declining, without the log entry on her side until expiry.
- **4a.** No other slot fits: Dana sees "no slots" and can widen the window.

```mermaid
flowchart TD
    A[Offer shown] --> B{Dana decides}
    B -->|Decline| C[Log decline locally]
    C --> D[Hold released at expiresAt]
    D --> E{New preference?}
    E -->|Yes| F[New availability_request, UC-01]
    E -->|No| G[Done, nothing booked]
    B -->|Ignore| D
    B -->|Approve| I[UC-02]
```

---

## UC-04. Reschedule or cancel a booking

**Phase 2.**

- **Actors:** Dana, Dana's agent, Marcus's agent. Marcus can also cancel from the shop side.
- **Preconditions:** a confirmed booking exists in both audit logs.
- **Trigger:** Dana cancels or asks to move the booking.
- **Postconditions:** cancel: slot freed, both logs updated. Reschedule: new slot booked first, then the old one freed.
- **Related:** FR-BOOK-03, FR-MSG-10, FR-GATE-01, FR-GATE-03.

**Main flow (cancel)**

1. Dana chooses the booking and cancels. Her agent confirms with her first (cancelling is a commitment change).
2. Her agent sends `cancel_request` with the `bookingId`, which opens an A2A Task.
3. The barber agent checks the booking belongs to this customer, frees the slot, logs it and completes the Task with `cancelled`.
4. Dana's agent removes the calendar entry and logs it.

**Main flow (reschedule)**

1. Dana asks to move the booking. Her agent sends `reschedule_request` with the `bookingId` and the new window.
2. The barber agent answers with an `offer` (as in UC-01).
3. Dana approves it and the normal UC-02 flow books the new slot.
4. Once the new booking is confirmed, the barber agent frees the old slot and both sides log it.

**Alternate and exception flows**

- **3a.** Cancel refused (for example inside a shop's cancellation cutoff, if the shop sets one): the Task ends `REJECTED` with a reason; nothing changes.
- **Reschedule 2a.** No slot in the new window: `no_availability`; the old booking stays.
- **Reschedule 3a.** The new offer expires or is declined: the old booking stays.
- **Later.** Marcus cancels from the shop side and Dana's agent is notified. This needs a business-to-person message the `hitchpost/1` contract doesn't have yet.

```mermaid
sequenceDiagram
    actor Dana
    participant DA as Dana's agent
    participant BA as Barber agent
    participant Book as Appointment book

    Dana->>DA: Cancel Thursday 17:30
    DA-->>Dana: Confirm cancel?
    Dana->>DA: Yes
    DA->>BA: cancel_request(bookingId), opens Task
    BA->>Book: booking belongs to sender? allowed by policy?
    alt allowed
        Book-->>BA: freed
        BA-->>DA: Task COMPLETED: cancelled
        DA-->>Dana: Cancelled
    else not allowed
        BA-->>DA: Task REJECTED with reason
        DA-->>Dana: Can't cancel, with reason
    end
```

---

## UC-05. Register a business agent in the directory

**Phase 3.**

- **Actors:** Marcus (or Priya on his behalf), Directory.
- **Preconditions:** the business has an A2A agent with a reachable agent card.
- **Trigger:** Marcus submits his agent card URL and business details.
- **Postconditions:** a verified listing is live and searchable.
- **Related:** FR-DIR-01, FR-DIR-03, FR-DIR-04.

**Main flow**

1. Marcus enters the shop name, area, services, IANA time zone and agent card URL (`POST /v1/listings`, status `pending`).
2. The directory fetches the card, validates it, and checks the card's interface URL has the same origin as the submitted URL.
3. The directory asks Marcus to prove control of that origin (`POST /v1/listings/{id}/verify`: a well-known token file or a DNS TXT record).
4. Marcus completes the check.
5. The listing goes live marked verified.

**Alternate flows**

- **2a.** The card is missing, invalid or points at another origin: registration is refused with the reason.
- **4a.** Verification fails or times out: the listing stays unpublished.
- **Later.** Marcus updates (`PATCH /v1/listings/{id}`) or closes (`DELETE`) the listing; changing `cardUrl` resets verification and repeats steps 2 to 4.

---

## UC-06. Find a business agent

**Phase 3.**

- **Actors:** Dana or Dana's agent, Directory.
- **Preconditions:** verified listings exist.
- **Trigger:** a search by name, service or area.
- **Postconditions:** Dana's agent has a verified card URL to use in UC-01.
- **Related:** FR-DIR-02, FR-DIR-03, FR-DIR-05.

**Main flow**

1. Dana (or her agent) searches "fade near Downtown" (`GET /v1/listings?q=fade&near=…`).
2. The directory returns matching verified listings, nearest first, with verification status and, from Phase 5, rating summaries.
3. Dana picks one. Her agent fetches the card and checks its interface origin matches the listing before sending anything.

**Alternate flows**

- **2a.** No results: suggest widening the area or service.
- **3a.** Origin mismatch: her agent refuses, and the listing is reported automatically (UC-09).

---

## UC-07. Add an agent as a contact and chat in the app

**Phase 4.**

- **Actors:** Dana, the client app with its built-in personal agent (the consumer agent at launch, A-08), a business agent.
- **Preconditions:** Dana has the app installed and signed in.
- **Trigger:** Dana adds a business from the directory, or pastes any A2A agent URL.
- **Postconditions:** the agent is in her contacts; conversations with it run UC-01 to UC-04 in the app.
- **Related:** FR-APP-01 to FR-APP-05, NFR-A11Y-01.

**Main flow**

1. Dana finds a business (UC-06) and taps "Add contact".
2. The app stores the contact with its verified card URL.
3. Dana opens the chat and types "cut Thursday after work". The app turns this into a structured request she confirms (service, window).
4. The conversation follows UC-01; offers appear as approval cards (UC-02).

**Alternate flows**

- **1a.** Dana pastes an unlisted agent URL: the app warns that it isn't verified before adding it.
- **Any step.** Dana blocks a contact: no further messages from it are shown or answered.

---

## UC-08. Rate an interaction

**Phase 5.**

- **Actors:** Dana and Marcus (each rates the other side), Directory.
- **Preconditions:** a verified interaction exists in both audit logs (a booking, a decline or a no-show).
- **Trigger:** the interaction ends (appointment time passes, or the offer is declined).
- **Postconditions:** the structured metrics update; an optional short review is attached.
- **Related:** FR-RATE-01 to FR-RATE-03.

**Main flow**

1. The directory computes behaviour metrics from the interaction (response time, offer honoured, stayed within its card's skills).
2. Dana is asked for an optional rating and short review.
3. The review is stored against that interaction, once per side.

**Alternate flows**

- **1a.** No verified interaction: rating is refused.
- **3a.** A second rating for the same interaction and side: refused.

---

## UC-09. Report an abusive or fake agent

**Phase 5.**

- **Actors:** anyone (Dana, Marcus, Priya, an agent automatically), Directory, Sam.
- **Preconditions:** the agent is listed or has interacted with the reporter.
- **Trigger:** a report with a reason (impersonation, spam, misleading offers, abuse).
- **Postconditions:** the report is queued for moderation (UC-10); severe automatic signals can suspend a listing pending review.
- **Related:** FR-ADMIN-01.

**Main flow**

1. The reporter picks a reason and adds details.
2. The directory records the report with links to the related interactions.
3. Sam is notified.

**Alternate flows**

- **2a.** Many reports in a short time, or an origin mismatch: the listing is suspended automatically until Sam reviews it.

---

## UC-10. Moderate the directory and handle reports

**Phase 6.**

- **Actors:** Sam, Directory, the reported business.
- **Preconditions:** reports exist (UC-09).
- **Trigger:** Sam opens the moderation queue.
- **Postconditions:** each report is resolved (dismissed, warning, suspension, removal), the business is notified with the reason, and the action is in the moderation audit trail.
- **Related:** FR-ADMIN-01, FR-ADMIN-02.

**Main flow**

1. Sam reviews the report and the linked audit records.
2. Sam chooses an action and a reason.
3. The directory applies it and notifies the business.
4. The action is recorded in the moderation trail.

**Alternate flows**

- **3a.** The business appeals: Sam re-reviews; the outcome is recorded too.
