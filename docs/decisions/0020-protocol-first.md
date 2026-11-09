# 0020. Protocol first: no pricing, minimal MCP gateway in v1

- **Date:** 2026-11-09
- **Status:** Accepted

## Context

The plan priced a business agent line at $15 a month and later added a fee on paid agent subscriptions. The final independent QA review found a hole in that logic: in v1 nothing sent a paying business any customers. The only demand channel was Hitchpost's own app, used by the 30 to 60 people in the pilot, while rivals already reached people's assistants (Fresha's MCP server, Booksy through Google AI Mode).

Underneath that hole was a framing question I hadn't settled. Is Hitchpost a business to monetise now, or a protocol to get adopted first?

## Decision

Hitchpost is a protocol first. It is an open extension on A2A (`hitchpost/1`) with an MIT-licensed reference implementation, so that anyone's agent can talk to other agents directly. That covers Claude, ChatGPT, Gemini, a business's booking AI or a custom agent.

- **Nobody pays.** The business line price (P-26) and the subscription fee (P-30) are retired. Monetization is Later and undecided, and depends on adoption.
- **A minimal MCP gateway is a v1 Must in Phase 3**, so people's own assistants can find a business agent line, ask for availability and approve through an explicit confirmation. This is the demand channel the plan was missing.
- **The first users are AI power users and agent developers**, who are self-serve and already understand MCP. Businesses join because an agent line is free. Barbers stay the first business demonstration.
- **Success is adoption.** That means independent implementations passing the conformance kit, and human-approved agent-to-agent tasks completed each week.

## Alternatives considered

- **Price businesses from the pilot ($15 per line):** a business pays before anything sends it customers. This also adds sales work that a solo owner can't carry.
- **Per-booking or per-new-customer fees:** these reward misreporting or need fragile attribution. The panel audit flagged both.
- **Keep the built-in app as the only channel and add the MCP gateway after v1:** v1 can't show real demand, and rivals already reach assistants.

## Consequences

- The business case becomes an adoption case. The cost side stays: the budget to v1 is unchanged at $15,390 with contingency.
- The project has no revenue by design. Sustainability risk is recorded in the RAID log.
- The MCP gateway adds Phase 3 work and a new threat surface: a confused deputy, or a hostile prompt trying to auto-approve. A human confirms every approval.
- The documents are frozen after this change, until the Phase 2 spike proves the booking protocol in code.
