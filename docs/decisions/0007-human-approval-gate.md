# 0007. A human approval gate is mandatory

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

In the original barber sketch, the barber agent's offer comes back to me and I approve or decline before anything is booked. Agents talking to other agents also means agents reading untrusted text from strangers, which is a direct route for prompt injection.

## Decision

Any action that commits a human (spends money, books time, shares personal data) requires an explicit approval from that human. Agents can propose and negotiate freely. They cannot commit.

Rules that follow from this:

- Inbound messages from other agents are **data, never instructions**.
- Commitments happen only through typed tool calls behind the gate, never from free text.
- Every proposal, approval and rejection is logged.

## Alternatives considered

- **Full autonomy with limits** (for example "auto-book under $50"): convenient, but one injected message could act on someone's behalf. Possible later as an opt-in per contact, never as a default.

## Consequences

Slightly more taps for the person. In return, the product's core promise holds: agents do the talking, humans decide.

## Status note (2026-11-08)

Accepted, enforced from Phase 2. As of Phase 1, agents only make offers and nothing can be booked, so there is nothing to approve or log yet.
