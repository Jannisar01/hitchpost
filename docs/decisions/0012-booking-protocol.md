# 0012. Booking protocol: Messages for questions, Tasks for commitments

- **Date:** 2026-11-09
- **Status:** Accepted, amended 2026-11-09 (see the amendment at the end)

## Context

Phase 2 turns an offer into a booking. Two independent reviews of the design found that the first draft didn't hold together:

- The offer hold was 10 minutes, but a shop on manual approval could take 30 minutes to decide. The offer had no state for "waiting on the shop", so the hold could lapse mid-decision and the same slot could be offered to someone else.
- The draft parked the booking in A2A `INPUT_REQUIRED` while the shop decided. In A2A that state means the _client_ must supply input, so a compliant personal agent would try to answer it. The A2A JS SDK 1.3 also stops draining executor events once a task reaches `INPUT_REQUIRED` (`dist/server/index.js:2181`: the consumer loop exits on a terminal or input-required status), so the shop's later decision would never reach the client.
- There was no way to decline an offer early, refuse a cancel, or link a reschedule to the booking it replaces. Retries could create duplicate tasks, and the two machines' clocks were compared directly.

## Decision

The full contract is in [13 Interfaces](../sad/13-interfaces.md); this records the decisions and why.

1. **Questions are Messages, commitments are Tasks.** `availability_request` and `offer_declined` get a Message reply. `booking_request`, `cancel_request` and `reschedule_request` each run as an A2A Task, giving a durable id for audit, polling and retries.
2. **Offer states.** Held → Booked (standing approval); Held → Reserved (booking request accepted while the shop decides) → Booked or Released; Held → Declined (`offer_declined`, releases the hold at once); Held → Expired (offer hold, P-01). Held and Reserved offers block the slot.
3. **The business clock is authoritative.** Offers carry `issuedAt` and `expiresAt`. The personal agent's deadline is its receive time plus (`expiresAt` − `issuedAt`), less a safety margin (P-09). No rule compares timestamps from two machines.
4. **Waiting on the shop uses `WORKING`, not `INPUT_REQUIRED`.** The Task stays `WORKING` with the status message "Waiting for the shop" for at most the manual approval wait (P-03). The personal agent sends with `returnImmediately: true` and polls `GetTask` until a final state or its booking deadline (P-04). v1 has no push notifications.
5. **Recheck at write.** The slot is checked again inside the transaction that writes the booking.
6. **Rejection reasons:** `booking_rejected` uses `expired`, `unknown_offer`, `slot_taken`, `shop_declined`, `shop_timeout`, `other`. A refused cancel ends the Task `REJECTED` with `cancel_rejected` (`cutoff`, `unknown_booking`, `other`).
7. **Reschedule is an atomic swap.** `reschedule_request` is answered with an offer carrying `replacesBookingId`. The old booking is cancelled only in the transaction that confirms the new one.
8. **Context binding.** Every follow-up message must arrive in the original offer's `contextId`. The server mints it, so until agent authentication (Phase 6) it is a bearer capability: logged, never shown in a UI, never put in a URL.
9. **Idempotency.** The business keeps `offerId → taskId`; a repeated `booking_request` returns the existing Task in any state. Clients reuse `messageId` on retry.
10. **Hold caps.** At most P-07 open holds per `contextId` and per sender (client IP until Phase 6, agent identity after). Beyond that the business answers `rejected` and issues no hold.
11. **Contract version** is an `AgentCapabilities.extensions` entry (`https://hitchpost.dev/ext/contract/v1`, `required: true`), because `AgentCard` has no metadata field. Messages list the uri in their `extensions`.
12. **Correlation and integrity.** From Phase 2 both sides log `contextId`, `taskId`, `offerId` and `messageId` on every audit event. `payloadHash` is SHA-256 over the JCS (RFC 8785) canonical JSON of the data part.
13. **Shop-side cancellation** of a confirmed booking is Later: it needs a business-to-person push that `hitchpost/1` doesn't have.

## Alternatives considered

- **`INPUT_REQUIRED` for the shop's decision:** wrong A2A semantics, and it doesn't work with the SDK (above).
- **Extend the offer hold to 30 minutes for everyone:** blocks a chair for half an hour on every unanswered offer, which hurts shops that use standing approval.
- **Push notifications instead of polling:** fewer requests, but the personal agent would need a reachable webhook. That's a poor fit for a CLI or phone, so it waits until a real need appears.
- **Let unused offers simply expire (no decline message):** simpler, but a person browsing alternatives would tie up several chairs and hit the hold cap.

## Consequences

The personal agent has to poll, and it needs a second, longer deadline for bookings (P-04) next to the 10-second deadline for questions (P-05). The business agent needs persistent state from Phase 2 (offers, tasks, audit) so a restart during a 30-minute wait doesn't lose the booking: SQLite through the SDK's `DatabaseTaskStore`. Until agent authentication arrives in Phase 6, anyone holding an `offerId` or a `bookingToken` can act on that offer or booking. That's acceptable only because both are random, server-minted and never exposed outside the two agents.

## Amendment, 2026-11-09

A second independent review checked decisions 8, 9, 10 and 11 against the SDK and found three of them unbuildable as written. I verified each against `@a2a-js/sdk` 1.3.0 `dist/server/index.js` before changing anything:

- **Required extensions come from a header.** The handler checks required extensions against `context.requestedExtensions`, which the transport fills from the `A2A-Extensions` HTTP header, not from `message.extensions` (lines 2775-2781). A client that only lists the uri in the message is refused with `ExtensionSupportRequiredError`.
- **Retries make new tasks.** A send without `taskId` gets `crypto.randomUUID()` (line 2801). A send that names a task already in a terminal state throws `UnsupportedOperationError` (line 2789).
- **`contextId` is client-chosen.** The handler keeps the `contextId` the client sent (line 2815). It was never server-minted, so it can't be an authority, and a per-`contextId` cap is dodged by sending a new one.

The decisions change as follows (13 Interfaces has the full rules):

- **Replaces 8 (context binding): capabilities.** Authority comes from server-minted secrets. `offerId` (random UUID v4) authorises booking or declining that offer. `booking_confirmed` carries a `bookingToken` (128-bit random, base64url) that `cancel_request` and `reschedule_request` must present. `contextId` is for correlation only.
- **Replaces 9 (idempotency).** A client that has the `taskId` retries with `GetTask`. A client that lost the response resends without a `taskId`; the business looks up `offerId → taskId` and the new Task completes at once with the original payload plus `duplicateOf: <original taskId>`. No second booking. Cancels work the same way through `bookingId → taskId`.
- **Replaces 10 (hold caps).** The cap (P-07) is per sender only: the client IP until Phase 6, then agent identity.
- **Amends 11 (contract version).** The extension stays `required: true`. Clients send its uri in the `A2A-Extensions` header (JS SDK: `serviceParameters`) as well as in each message's `extensions`.
- **Amends 1 and 7 (reschedule).** `reschedule_request` is a question, so it is a Message, answered with an offer carrying `replacesBookingId`, `no_availability`, or `rejected` with reason `cutoff`. The shop's cancellation cutoff (P-10) is checked at the question and again at the swap; at the swap the Task ends `booking_rejected` with the new reason `cutoff`.
- **Amends 2 (offer states).** A Reserved offer keeps its `expiresAt` (it is part of what the person approved). The reservation has its own `reservedUntil` = acceptance time + P-03.

Why not simply mint the `contextId` on the server and reject client-supplied ones? Because A2A clients legitimately set `contextId` to group their own conversations, and rejecting it would break interoperability with agents I didn't write (release criterion RC6). A separate secret costs one field and keeps the protocol standard.
