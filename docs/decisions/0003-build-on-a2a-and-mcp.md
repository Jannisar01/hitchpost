# 0003. Build on A2A for agent to agent, MCP for tools

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

My first sketch named MCP as the agent-to-agent solution. On review, MCP connects an agent to its own tools and data. Agent-to-agent messaging is a separate problem, and an open protocol for it already exists: A2A (Agent2Agent), now under the Linux Foundation. A2A agents publish an _Agent Card_ describing who they are and what they can do.

## Decision

- Agents talk to each other over **A2A**.
- Each agent reaches its own tools (calendar, booking system) over **MCP**.
- Hitchpost adds what neither covers: the directory, the human approval gate and ratings.

## Alternatives considered

- **Own protocol:** months of work to reach parity, and no other agent would speak it.
- **MCP for everything:** possible to bend, but MCP is shaped as client and tool server, not two peers negotiating.

## Consequences

I depend on A2A's direction and pace. In return, any A2A-speaking agent can join Hitchpost from day one, and the project's effort goes into what is actually missing.
