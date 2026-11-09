# 0021. Refuse ListTasks; treat taskId and bookingToken as bearer secrets

- **Date:** 2026-11-09
- **Status:** Accepted
- **Evidence:** `packages/e2e/src/sdk-behaviour.test.ts` (F1, F2, F6), run against `@a2a-js/sdk` 1.3.0

## Context

The design said a booking's `bookingToken` must never appear in stored task history, because the open finding O-1 worried that tasks leak. The Phase 2 spike ran the SDK instead of reading it, and found:

- **F1:** whatever a Task's final status message carries is stored, and `GetTask` returns it to anyone who presents the taskId.
- **F2:** with `UserBuilder.noAuthentication`, `ListTasks` returns every caller's tasks, secrets included.
- **F6:** a `DefaultRequestHandler` subclass can refuse `ListTasks` and `CancelTask` while sending keeps working.

The token has to reach the person in the booking confirmation, and that confirmation is the Task's final message. So "never in task history" can't be met by any design that answers through the Task.

## Decision

- Hitchpost agents refuse `ListTasks` for every caller, and refuse `CancelTask` on booking Tasks; a cancellation goes through `cancel_request` and its token (`MethodPolicyHandler`, `packages/barber-agent/src/server.ts`).
- A `taskId` is a bearer secret: holding it lets you read that one Task. Clients store it like the token and never show it in a UI or URL.
- The `bookingToken` is derived, not stored: HMAC-SHA256 of the bookingId under a key the business agent holds. The same booking always yields the same token, so a resend gets the identical confirmation (`packages/barber-agent/src/executor.ts`).
- Superseded rule: "never place a bookingToken in task history" (FR-MSG-18, T-04, T-28) becomes "no method lists tasks, and reading a Task needs its taskId".

## Alternatives considered

- **Send the token outside the Task** (a second Message or a side channel): two round trips for one commitment, and the Task would no longer be the record of what was agreed.
- **Encrypt the token to the client:** needs client keys, which arrive with agent authentication in Phase 6.
- **Keep `ListTasks` and filter by caller:** there is no caller identity until Phase 6, so nothing to filter on.

## Consequences

The protection rests on refusing one method and on taskIds being unguessable (random UUIDs from the SDK). When agent authentication arrives in Phase 6, `ListTasks` can return a caller's own tasks again, scoped by identity. The e2e test "ListTasks and CancelTask are refused" fails if the policy is ever dropped (checked by mutation).
