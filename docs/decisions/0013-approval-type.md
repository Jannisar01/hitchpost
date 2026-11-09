# 0013. Approval is a type only the gate can create

- **Date:** 2026-11-09
- **Status:** Proposed. Decide by M-03 (Phase 2 gate), before the booking code in my agent merges.

## Context

FR-GATE-01 says nothing commits a person without their explicit approval, and FR-GATE-04 says only an approval value can unlock the booking call. A boolean flag or a "confirmed" string can be set by any code path, including one that reads text from another agent. The rule has to be enforced by the type system and by tests, not by convention.

## Options

- **Branded `Approval` type with a private constructor.** Only the gate module can create one; `sendBookingRequest(approval)` accepts nothing else. The approval carries the `offerId` it was made for and the time it was made.
- **Runtime check only.** The booking function looks up a logged decision before sending. Works in JavaScript callers too, but a missed call site fails at run time, not at compile time.
- **Both.** The type stops mistakes at compile time; the runtime lookup of the logged decision catches anything that bypasses types.

## Decision the design currently assumes

Both. `Approval` is a branded type exported only as a type from `packages/my-agent`; the gate is the only module that constructs it, and only after recording the person's decision in the audit log. `sendBookingRequest` takes an `Approval` and refuses one whose `offerId` doesn't match the request (TC-30 to TC-33 in 15).

## Consequences

Booking without a recorded approval can't compile and can't run. The cost is a little ceremony in tests, which must go through the gate to get an `Approval`.
