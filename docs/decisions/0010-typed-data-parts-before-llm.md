# 0010. Agents exchange typed data, and the language model comes later

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

Phase 1 has to prove that two agents can find each other and do business over A2A. The obvious move is to put a language model in each agent and let them chat in English. But that would test two unknowns at once, the wire and the model, and every test run would need an API key and would cost money.

## Decision

- The booking conversation is a small set of **typed messages** (`availability_request`, `offer`, `no_availability`, `rejected`) sent as A2A **data parts**, never as free text.
- Every inbound message is **validated and rebuilt** from known fields before use (`parseAvailabilityRequest`, `parseBarberReply` in `@hitchpost/core`). Unknown fields are dropped.
- No language model in Phase 1. The model's job, added later, is to turn what a person says ("Thursday after work") into an `availability_request`. It never decides what gets booked.

## Alternatives considered

- **LLM-to-LLM chat in natural language:** demos well, but it's slow, costs money per run, can't be tested deterministically, and gives prompt injection a free path between agents.
- **A custom JSON-RPC API next to A2A:** simpler today, but then any other A2A agent couldn't talk to ours.

## Consequences

The whole flow runs in tests in under a second, with no keys. The security rule from ADR 0007 is now enforced in code: another agent can only ever send us one of four known shapes. The cost is that the barber side only understands structured requests until the model layer is added.

## Correction (2026-11-08)

The Phase 1 audit showed this was weaker than written. `Date.parse` let prose through date fields, and text fields allowed control characters. Both were fixed (strict ISO 8601, no control characters). Free-text fields like `service` and `reason` still exist, so typed messages _narrow_ the injection surface rather than close it. That must be handled before a language model reads them. The tests run in about two seconds, not under one.
