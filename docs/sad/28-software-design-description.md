# HP-SAD-28 · Software design description

| Field       | Value                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| Document ID | HP-SAD-28                                                                  |
| Version     | 1.1                                                                        |
| Status      | Frozen for Phase 2 spike                                                   |
| Date        | 2026-11-09                                                                 |
| Owner       | Sanaullah Jannisar, product and engineering lead                           |
| Conforms to | IEEE 1016-2009 (software design descriptions: viewpoints and design views) |

## 1. Purpose and scope

This is the backend software design description: the agents, the core library and the stores behind them. It organises the design by the IEEE 1016 viewpoints, gives the module-level technical design that the other documents leave out, and records the rationale. Where a design view already exists elsewhere in the package, this document links to it rather than repeating it.

The frontend has its own specification in [27](27-frontend-technical-specification.md). The split into deployable units is in [26 Service architecture](26-service-architecture.md).

**Pilot simplification.** The pilot runs standing approval only. A booking therefore completes inside one request: the business agent checks the offer, writes the booking and answers. The delayed-completion design (manual approval, open finding O-2) is kept here as a proposed design for Later and is labelled so.

## 2. Design stakeholders and concerns

| Stakeholder                                  | Concerns this description must answer                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Me, as owner and only engineer               | Can I build Phase 2 from this without re-deciding things?                                        |
| Contributors (Priya and future team members) | Where does each responsibility live; what may I change safely?                                   |
| Outside agent developers                     | Which behaviour is protocol (hitchpost/1) and which is a quirk of our JavaScript implementation? |
| Security reviewer                            | Where is untrusted input checked; what is never logged; who can call which method?               |
| Operator (Sam)                               | How the system starts, stops, recovers, and what the logs say                                    |

## 3. Viewpoints and where each design view lives

| Viewpoint (IEEE 1016 clause 5) | Design view                                    | Location                                                                                             |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Context                        | System context, external actors                | [10 Architecture](10-architecture.md) section 3                                                      |
| Composition                    | Containers and deployable units                | [10](10-architecture.md) section 4; [26](26-service-architecture.md) section 8                       |
| Logical                        | Classes and their relationships                | [21 UML models](21-uml-models.md) sections 4 and 5                                                   |
| Dependency                     | Packages and modules                           | [21](21-uml-models.md) section 6; this document section 4                                            |
| Information                    | Entities, schemas, data dictionary             | [08](08-data-design.md), [09](09-data-dictionary.md), [22](22-enhanced-entity-relationship-model.md) |
| Interface                      | Agent message contract, directory and App APIs | [13 Interfaces](13-interfaces.md)                                                                    |
| Interaction                    | Sequences                                      | [21](21-uml-models.md) section 7; [10](10-architecture.md) section 6                                 |
| State dynamics                 | State machines                                 | [07](07-process-and-behaviour-models.md) section 8; [21](21-uml-models.md) section 8                 |
| Algorithm                      | Slot finding, hold caps, de-duplication        | This document section 6                                                                              |
| Resource                       | Memory, CPU, storage, connections              | This document section 8                                                                              |

## 4. Module design

### 4.1 Core library (`packages/core`, Built)

| Module            | Responsibility                                                                                                                      | Notes                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `booking.ts`      | Message types; strict validation of everything another agent sends (`parseAvailabilityRequest`, `parseBarberReply`); `offerMatches` | Built. Trust boundary: every inbound value is rebuilt from known fields. Limits P-19 and P-20. |
| `a2a.ts`          | `dataPart`, `firstData` helpers over the SDK's Part type                                                                            | Built                                                                                          |
| Phase 2 additions | JSON Schemas for every hitchpost/1 kind, generated from the same types, published with the conformance kit                          | The schemas, not the TypeScript, are the language-neutral contract for outside agents.         |

### 4.2 Business agent (`packages/barber-agent`)

| Module                | Responsibility                                                                                                                    | Status                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `book.ts`             | Appointment book and `findFreeSlot` with overlap, opening hours, past-slot and window rules                                       | Built                                |
| `executor.ts`         | Answers availability requests with offer, no_availability or rejected                                                             | Built                                |
| `server.ts`           | A2A server: agent card, JSON-RPC handler, safe error handler, binding to 127.0.0.1                                                | Built                                |
| Book validation       | Validate the business's own configuration at load: hours, unique service ids, currency, booked ranges; refuse to start if invalid | Phase 2 (D-15)                       |
| Offer store           | Persist offers with `issuedAt`, `expiresAt`, sender and messageId; holds                                                          | Phase 2                              |
| Booking handler       | `booking_request`: check offer, check slot, write booking, answer, all in one transaction                                         | Phase 2                              |
| Cancel and reschedule | `cancel_request`, `reschedule_request` with `bookingToken`, cutoff checks                                                         | Phase 2                              |
| Method policy         | Restrict which A2A methods outside callers may use (section 5.1)                                                                  | Phase 2, proposed (open finding O-1) |
| Scheduler             | Persisted timers for expiry and retention (section 5.4)                                                                           | Phase 2                              |
| Health and shutdown   | `/healthz`, graceful shutdown (section 7)                                                                                         | Phase 2                              |

### 4.3 Personal agent (`packages/my-agent`)

| Module                 | Responsibility                                                                                                                                                                 | Status  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `ask.ts`               | Resolve the card, refuse cards whose interfaces leave the asked origin, one deadline for the whole exchange, no redirects, validate the reply and check it answers the request | Built   |
| `main.ts`              | Command-line front end, shows only its own error messages                                                                                                                      | Built   |
| Approval gate          | The only code path that can create an `Approval` value (ADR 0013, proposed)                                                                                                    | Phase 2 |
| Personal booking store | Keeps `bookingId` and the `bookingToken` for cancel and reschedule; the token never leaves this store                                                                          | Phase 2 |
| JSONL audit log        | Append-only log of offers, decisions and results with correlation ids                                                                                                          | Phase 2 |
| Install key            | Random 128-bit key per install, sent in a request header so caps work behind shared IPs                                                                                        | Phase 2 |

### 4.4 Minimal MCP gateway (`packages/mcp-gateway`, Phase 3, v1 Must, UC-12)

The tool contract is in [13](13-interfaces.md) section 6; this is the module design.

| Module                                     | Responsibility                                                                                                                                                                                                                                                  | Status  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Tools `find_agent_line`, `read_agent_line` | Search the directory API for agent lines by service, area and name; fetch a line's card, profile and services with the same origin pinning and no-redirect fetch as `ask.ts`                                                                                    | Phase 3 |
| Tool `request_availability`                | Send a validated `availability_request` through the personal agent library (`askForSlot`) and return the validated offer                                                                                                                                        | Phase 3 |
| Tools `approve_offer`, `confirm_booking`   | `approve_offer` returns a confirmation step (deep link or the assistant's own confirmation UI); `confirm_booking` sends the booking only with the one-time confirmation the human produced there. No tool approves on its own, whatever the model's prompt says | Phase 3 |
| Tool `decline_offer`                       | Sends `offer_declined` so the hold is released at once                                                                                                                                                                                                          | Phase 3 |
| Session and tokens                         | Per-assistant MCP session; gateway credentials and any `bookingToken` stay server-side and are never returned in a tool result                                                                                                                                  | Phase 3 |

The gateway holds no booking state of its own: it is a thin adapter over the personal agent library and the directory API. Relationships, consultation and the rest of the full gateway are stage L3.

### 4.5 Dependencies

`core` depends only on the A2A SDK's types. Both agents depend on `core` and the SDK. Nothing depends on an agent package except tests; end-to-end tests move to their own package in Phase 2 so the agents don't depend on each other.

**Identity dependency (network stages L1 to L3).** Relationship tiers (`RelationshipTier`: owner (the owner's own agent family), friend (mutual), subscriber (Later, unpriced), follower (one-way), public; `blocked` is an edge state, not a tier) need to know who is calling. Agent authentication and card signing are planned for Phase 6 (ADR 0017, proposed); they must move to the phase that introduces relationships. Until then, every caller is anonymous, and only server-minted capabilities (`offerId`, `bookingToken`) carry authority. No module may branch on a caller's claimed identity before ADR 0017 is accepted and built.

## 5. Technical design of the Phase 2 mechanisms

### 5.1 Method policy (proposed design for open finding O-1)

The SDK's JSON-RPC handler exposes `ListTasks`, `GetTask` and `CancelTask` (SDK `dist/server/index.js`, the switch near line 3722). With no authentication, every caller shares one task scope, so `ListTasks` would list everyone's tasks. The design wraps the SDK request handler:

| Method        | Policy                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `SendMessage` | Allowed; all business rules apply                                                                 |
| `GetTask`     | Allowed only for a known `taskId` (the id is treated as a bearer secret); history is not returned |
| `ListTasks`   | Refused with the A2A unsupported-operation error                                                  |
| `CancelTask`  | Refused for booking tasks; a cancellation must be a `cancel_request` with its `bookingToken`      |

`bookingToken` is derived as HMAC-SHA-256 over the `bookingId` with a server key, truncated to 128 bits and base64url encoded, so a duplicate request can be answered with the same token without storing it in clear. Only its hash is stored for lookup. A test asserts that no token appears in any task history the SDK stores.

### 5.2 Persistence: bookings are the source of truth

The SDK's task store and the booking tables cannot share one transaction (the SDK store takes its database handle once). So the booking tables are the source of truth, and the SDK task state is derived:

1. A booking request writes the booking (and its outbox event, [26](26-service-architecture.md) section 6.2) in one SQLite transaction (`BEGIN IMMEDIATE`, WAL mode, `busy_timeout`).
2. The answer is built from the committed row.
3. At startup, a rebuild step walks offers and bookings changed since the last clean shutdown and writes any missing or stale task status into the task store.

A crash between the booking commit and the task write is therefore repaired at the next start, and a task can never claim a booking the table doesn't have.

### 5.3 De-duplication

| Request                | Key                                                                      | Behaviour on a repeat                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `availability_request` | (sender, messageId), where sender is the install key, falling back to IP | Return the same offer while it is held; don't create a second hold                                                       |
| `booking_request`      | `offerId`                                                                | Return the original result with `duplicateOf` set to the original task id                                                |
| `cancel_request`       | `bookingId`                                                              | Return the original cancellation result                                                                                  |
| Concurrent duplicates  | Same keys                                                                | The unique constraint loser re-reads the winner's row and answers with `duplicateOf`; it never surfaces a database error |

### 5.4 Scheduler

One table, `scheduled_jobs(id, kind, ref, due_at, lease_until, attempts)`, holds every timer: offer expiry (P-01), retention purges (P-11 to P-14), outcome resolution, and Later the manual approval timeout (P-03) and reminders. A single loop claims due jobs with a lease, runs them, and deletes them. In Phase 2 (one process per business agent) the lease is trivially held; in Phase 6 (several instances) claiming uses `SELECT ... FOR UPDATE SKIP LOCKED`, so exactly one instance owns each job. Timers survive restarts because they are rows, not in-memory callbacks.

### 5.5 Caps

Open holds per sender are capped (P-07), open holds per business are capped independently of the sender (P-31, because install keys are client-chosen and can be rotated), and requests are rate limited (P-08). The sender is the install key from the request header, falling back to IP when there is none, and the agent identity once agent authentication exists (Phase 6, earlier with relationships). Counting uses the offer store for holds and a sliding one-minute window in memory for the rate limit.

### 5.6 Unknown kinds

- A business agent that receives a data part with an unknown `kind` replies `rejected` with reason `unsupported_kind`.
- A personal agent that receives a reply kind it doesn't know raises a safe error ("That agent answered in a way I don't support yet") and logs the kind. New reply kinds are only sent to clients that advertise support for them in the extension parameters.

### 5.7 Delayed completion (proposed design for open finding O-2, Later)

Needed only for manual shop approval, which is Later. When the business agent's executor returns with the task in WORKING, the SDK closes the event bus (`_settleBus`, near line 2985). The design adds a resolver that, when the owner decides or the timeout job fires, writes the final task status directly to the task store under the original task's context, and the client learns the result by polling `GetTask`. The scheduler's persisted due time covers restarts.

## 6. Algorithms

### 6.1 Slot finding (Built, `book.ts`)

```text
findFreeSlot(book, service, earliest, latest, now):
  if service not in book.services: return none
  taken = [(b.start, b.start + b.duration) for b in book.booked]
  t = roundUpTo30Min(max(earliest, now))
  while t <= latest:                       # window is at most 31 days (P-06): at most 1,488 iterations
    open = book.hours[weekday(t)]
    if open and minuteOfDay(t) >= open.from and minuteOfDay(t) + service.duration <= open.to:
      if no (from, to) in taken with t < to and from < t + service.duration:
        return t
    t = t + 30 min
  return none
```

Cost is bounded by the validated window: at most 1,488 slot checks, each against the booked ranges of that business.

### 6.2 Hold cap check (Phase 2)

```text
canHold(sender, business):
  bySender   = count offers where sender = sender and state = Held and expiresAt > now
  byBusiness = count offers where business = business and state = Held and expiresAt > now
  return bySender < 3 and byBusiness < business.holdCap   # P-07; P-31 (default 10)
```

### 6.3 Offer acceptance (Phase 2, standing approval)

```text
acceptBooking(offerId):
  BEGIN IMMEDIATE
    offer = select offer by offerId
    if none: answer booking_rejected unknown_offer
    if existing booking for offerId: answer original result with duplicateOf
    if now > offer.expiresAt: answer booking_rejected expired
    if slot overlaps any booking: answer booking_rejected slot_taken
    insert booking (copying service name, price, currency, duration)
    insert outbox booking_confirmed
  COMMIT
  answer booking_confirmed with bookingToken = hmac(bookingId)
```

## 7. Errors, logging, configuration, health

### 7.1 Error model

Business outcomes are successful responses carrying a data part (`rejected`, `booking_rejected`, `cancel_rejected`), not protocol errors: the call worked, the answer is no. Protocol failures use JSON-RPC errors:

| Situation                              | Response                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Malformed JSON                         | JSON-RPC parse error (-32700)                                                       |
| Not a valid JSON-RPC request           | Invalid request (-32600)                                                            |
| Unknown method                         | Method not found (-32601)                                                           |
| Method refused by policy (section 5.1) | The A2A unsupported-operation error from the SDK                                    |
| Required extension not declared        | The SDK's extension-support-required error                                          |
| Oversized body                         | HTTP 413 with a JSON error envelope                                                 |
| Unexpected failure                     | Internal error (-32603), no stack trace or path in the body, full detail in the log |

The current server returns a plain JSON body for transport errors; Phase 2 changes it to the JSON-RPC envelope above.

### 7.2 Structured logging

One JSON object per line, written to standard output.

| Field                                                      | Meaning                                       |
| ---------------------------------------------------------- | --------------------------------------------- |
| `ts`, `level`, `msg`                                       | Time (ISO UTC), level, short message          |
| `service`, `agentLineId`                                   | Which deployable and which agent line         |
| `contextId`, `taskId`, `offerId`, `messageId`, `bookingId` | Correlation ids (FR-MSG-11), when present     |
| `senderKey`                                                | Hash of the install key, never the key itself |
| `errCode`                                                  | Stable error code                             |
| `traceId`                                                  | Phase 6                                       |

Never logged: tokens, phone numbers, names, free-text notes, message bodies. Operational logs are kept 30 days.

### 7.3 Configuration and secrets

Configuration comes from environment variables, validated at start: port, data directory, public URL of the agent card (Phase 6; local agents derive it from the bind address), the HMAC server key, and log level. The process refuses to start on a missing or malformed value. Secrets are never in the repository; in Phase 6 they come from the host's secret store.

### 7.4 Health and graceful shutdown (Phase 2)

- `GET /healthz` returns 200 when the store is writable and the scheduler loop has run in the last minute.
- On SIGTERM: stop accepting connections, close idle keep-alive connections, finish in-flight requests for up to 10 seconds, release scheduler leases, close the database, exit.

## 8. Resource budgets

| Resource              | Budget                                                            | Basis                                           |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| Offer round trip      | p95 under 2 s (NFR-PERF-01)                                       | Slot search bounded by the 31-day window (P-06) |
| Business agent memory | Under 128 MB per process                                          | Small book, no model in the request path        |
| SQLite writes         | One writer per business; pilot traffic under 1 request per second | WAL mode handles this with large headroom       |
| Request body          | 100 KB (Express default, verified)                                | Messages are small structured parts             |
| Scheduler             | One loop per process, one-second tick                             | Due times are minutes apart                     |

## 9. Design rationale

| Decision                                              | Why                                                                                       | Alternative not taken                               |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Bookings table as source of truth, task state rebuilt | The SDK store can't join our transaction; one authoritative record avoids two-write drift | Writing both and hoping, or replacing the SDK store |
| HMAC-derived `bookingToken`                           | Re-issuable for duplicate replies without storing the clear token                         | Random tokens stored in clear (leak risk)           |
| Persisted scheduler                                   | Timers must survive restarts and run once across instances                                | In-memory `setTimeout` (lost on restart)            |
| Install-key caps                                      | Many people share one IP behind mobile carriers                                           | Per-IP caps only (locks out legitimate users)       |
| Business outcomes as data, not errors                 | Callers can tell "no" from "broken"                                                       | Error codes for every refusal                       |
| Standing approval only in the pilot                   | Completes in one request; removes the delayed-completion problem until it's needed        | Shipping manual approval first                      |

## 10. Traceability

| Section  | Requirements and decisions                   |
| -------- | -------------------------------------------- |
| 4.1, 5.6 | FR-MSG-03, FR-MSG-09, NFR-SEC-01, NFR-INT-01 |
| 4.3      | FR-GATE-01, FR-MSG-04, FR-MSG-05, FR-MSG-12  |
| 5.1      | FR-MSG-12, NFR-SEC-01                        |
| 5.2      | NFR-REL-02                                   |
| 5.3      | FR-BOOK-07                                   |
| 5.4      | FR-BOOK-01                                   |
| 5.5      | NFR-SEC-03                                   |
| 6        | FR-BOOK-04, FR-BOOK-02, FR-BOOK-09           |
| 7        | NFR-OBS-01, NFR-SEC-04                       |
| 8        | NFR-PERF-01, NFR-PERF-02                     |

## Revision history

| Version | Date       | Change                                                                                                        | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| 1.0     | 2026-11-09 | First baseline, including the round 4 identity dependency                                                     | S. Jannisar |
| 1.1     | 2026-11-09 | Round 5: protocol first (no pricing), minimal MCP gateway in v1, final QA fixes, frozen for the Phase 2 spike | S. Jannisar |
