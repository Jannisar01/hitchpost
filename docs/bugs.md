# Bug and fix log

Every real problem the project ran into: what happened, the root cause, the fix and what changed to stop it happening again. Newest first.

## 2026-11-09 · Found by the first CI run on GitHub

### CI failed on a byte-order mark in package.json

- **Problem:** the first pull request's CI stopped at the pnpm setup step with `SyntaxError: Unexpected token (U+FEFF, the byte-order mark)` reading `package.json`.
- **Root cause:** I had edited `package.json` (and six other files) with Windows PowerShell 5.1, which writes UTF-8 with a byte-order mark. pnpm on my machine tolerated it; the pnpm setup action in CI parses the file strictly. Nothing local caught it because every local tool was lenient.
- **Fix:** stripped the mark from all seven files.
- **Prevention:** `scripts/check-encoding.mjs` now runs inside `pnpm check` and fails on any tracked file that starts with a byte-order mark; it was tested against a planted one. Lesson: the first real CI run is a test in itself, which is why pushing mattered.

## 2026-11-09 · Found by the expert panel audit

### A card could send my agent's calls to another server

- **Problem:** my agent checked where it fetched the agent card from, but then sent the booking request to whatever address the card listed, following redirects. A hostile card could point the call at any host.
- **Root cause:** the SDK takes the call address from the card's `supportedInterfaces`; only the card fetch was locked down.
- **Fix:** resolve the card ourselves, refuse it if any interface is on a different origin from the address asked, and give the call transport the same no-redirect fetch.
- **Prevention:** an end-to-end test serves a card from one origin that names another, and expects a refusal.

## 2026-11-09 · Found by the SA&D engineering review

### Dates at 24:00 and impossible offsets were accepted

- **Problem:** `2026-11-12T24:00:00Z` passed validation and silently became the next day; offsets like `+14:59` and `+15:00` passed too.
- **Root cause:** the strict ISO pattern checked digit counts, not ranges.
- **Fix:** hours 00 to 23, minutes and seconds 00 to 59, offsets within -14:00 to +14:00.
- **Prevention:** four new cases in the bad-request table test.

## 2026-11-08 · Found by the Phase 1 audit

Details and reproductions: [audit report](audits/2026-11-08-phase-1.md). Each fix landed with a test that failed before it.

### My agent accepted any offer

- **Problem:** an offer for a different service, outside the requested window, at any price, passed validation.
- **Root cause:** replies were checked for _shape_, not for whether they answered the question asked.
- **Fix:** `offerMatches` checks service and window; `parseBarberReply` caps duration (24 h) and price.
- **Prevention:** end-to-end test against a "sneaky" barber agent that swaps service and price.

### Longer services overlapped bookings

- **Problem:** a 60-minute service was offered at 16:30 with 17:00 already booked. An off-grid booking (17:15) blocked nothing.
- **Root cause:** bookings were stored as start times and compared by exact match.
- **Fix:** bookings are time ranges; a slot is free only if its whole range overlaps none.
- **Prevention:** tests for a long service next to a booking and for an off-grid booking.

### Lenient date parsing let prose into typed fields

- **Problem:** `"IGNORE PREVIOUS INSTRUCTIONS 2026-11-10"`, `"1"`, `"11/12/2026"` and zone-less times were accepted. February 30 rolled into March.
- **Root cause:** validation used `Date.parse`, which accepts almost anything.
- **Fix:** strict ISO 8601 with an explicit zone, a real-day check, and rebuilding as canonical UTC.
- **Prevention:** table test of nine kinds of bad dates.

### Terminal escape injection

- **Problem:** a hostile reply could paint a fake green "BOOKED and APPROVED" in the CLI. Raw remote error text was printed too.
- **Root cause:** text fields allowed control characters; the CLI printed unknown errors as is.
- **Fix:** text fields reject all control characters; the CLI only prints its own error messages.
- **Prevention:** tests for escape codes and newlines in replies and requests.

### Past slots and unbounded windows

- **Problem:** slots in 2020 were offered; a window across the whole JavaScript date range was accepted.
- **Root cause:** no "now" in slot finding; no window limit.
- **Fix:** slot finding starts no earlier than now; windows are capped at 31 days.
- **Prevention:** tests with a fixed clock for past windows and for the cap.

### Agent card discovery could hang forever

- **Problem:** an agent that accepted the connection and never answered left my agent waiting indefinitely.
- **Root cause:** the timeout only covered the message call, not fetching the card.
- **Fix:** one deadline for the whole exchange; redirects refused.
- **Prevention:** end-to-end test against a silent server.

### Smaller fixes

- The executor closed the SDK's event bus itself, which would break multi-turn tasks in Phase 2. Removed; the SDK closes it.
- A Task reply was reported as "a reply I don't understand", losing the reason. It now reports the task state.
- The CLI crashed with a stack trace on a bad date. It now prints a usage message.
- The barber server sent Express stack traces with file paths. It now returns a plain JSON error.

## 2026-11-08 · Phase 1

### Barber agent crashed on load

- **Problem:** `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` on start; the type check failed with TS1294.
- **Root cause:** the constructor used the `private readonly book` parameter shorthand. Node runs our TypeScript by stripping types, and that shorthand generates code, so it can't be stripped.
- **Fix:** declared the field and assigned it in the constructor.
- **Prevention:** `erasableSyntaxOnly` in tsconfig flags it at type check. Once branch protection is on, CI blocks it from `main`.
