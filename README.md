# Hitchpost

[![CI](https://github.com/Jannisar01/hitchpost/actions/workflows/ci.yml/badge.svg)](https://github.com/Jannisar01/hitchpost/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Let your agent talk to other agents directly.** You just say yes.

Hitchpost is an open protocol: the `hitchpost/1` extension on [A2A](https://a2a-protocol.org), an MIT-licensed reference implementation, and a minimal [MCP](https://modelcontextprotocol.io) gateway for the assistant you already use. Every person and every business gets an agent line: an agent, from any vendor, that other agents can find and talk to. Your Claude can sort out a haircut with your barber's booking agent, or a time with a friend's agent, and nothing is committed until you approve it. **Nobody pays.** Booking is the first task type Hitchpost proves; the longer aim is an agent-to-agent social network where agents talk the way people do, within limits their owners set.

> Status: **Phase 1, agent line.** My agent asks, and a barber's agent offers a free slot over A2A. Approving and booking come in Phase 2. The design documents are frozen while the Phase 2 spike proves the protocol in code. Follow along in the [build journey](docs/journey/README.md).

## For people with an assistant

- **Use the assistant you already have.** The minimal MCP gateway (Phase 3) lets your Claude, ChatGPT or Gemini find an agent line, ask for availability and book, with no new app.
- **One offer, one explicit yes.** You see the business, price, cancellation terms and how long the slot is held. Nothing is booked until you confirm.
- **Free and any vendor.** Your agent line and contacts cost nothing, and Hitchpost works with any agent that speaks the open protocol.

## For developers

- **An open extension to A2A**, with a versioned message contract, JSON Schemas and a conformance kit you can point at your agent.
- **A neutral directory.** Listing your agent is free, and every assistant on the network can reach it.

## For businesses

- **Never miss a booking while you work.** Your agent line answers every agent, using the booking tool you already have.
- **You see who's coming.** Each booking carries the customer's name and phone.
- **Free.** No monthly fee, no fee per booking.

Hitchpost agents are rule-based software until a language model is added (the language-model stage); we don't call them AI before then.

## What works today

| Works                                                       | Not yet                                     |
| ----------------------------------------------------------- | ------------------------------------------- |
| Barber agent with an A2A Agent Card and an appointment book | Approving an offer and booking it           |
| My agent asks for a slot and validates the offer            | Audit log of decisions                      |
| Strict validation of everything another agent sends         | Directory, MCP gateway, client app, ratings |
| Calls only go to the origin the agent card came from        | Real booking systems, business time zones   |
| 23 tests, including end to end over A2A                     | Agent families, relationships, consultation |

## Roadmap

| Phase            | Goal                                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Foundation    | Repo, license, CI, code review, decision log                                                                                                                                |
| 1. Agent line    | Two agents talk over A2A                                                                                                                                                    |
| 2. Approval gate | Human yes or no, booking, audit log on both sides, conformance kit                                                                                                          |
| 3. Directory     | Register, verify and search agent lines; minimal MCP gateway for people's own assistants                                                                                    |
| 4. Client app    | WhatsApp-style app for people without an assistant; contacts are agent lines, people or businesses                                                                          |
| 5. Ratings       | Reviews from verified interactions                                                                                                                                          |
| 6. Production    | Hosting, auth, monitoring, abuse limits, a pilot in one Texas neighbourhood                                                                                                 |
| After v1         | L1 agent families across vendors; L2 owner profiles and relationship tiers; L3 full MCP gateway and consultation; L4 subscriptions (unpriced, only if adoption warrants it) |

## What it is built on

- **[A2A](https://a2a-protocol.org)** for agent-to-agent messaging. Hitchpost doesn't invent a protocol.
- **[MCP](https://modelcontextprotocol.io)** for each agent's own tools (calendars, booking systems) and for people's own assistants to reach Hitchpost. Phase 1 uses an in-memory appointment book.
- **Hitchpost adds** what's missing: identity for agent lines and their owners, a directory, a human approval gate logged for both sides, and reputation from verified interactions.

## Getting started

Requires Node 24+ and pnpm 10+.

```bash
pnpm install
pnpm check      # lint and format
pnpm typecheck
pnpm test
```

Try the two agents. In one terminal, start the barber agent:

```bash
pnpm --filter @hitchpost/barber-agent start
```

In another, ask it for a haircut over the next three days:

```bash
pnpm --filter @hitchpost/my-agent start
```

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md). Security issues go through [SECURITY.md](SECURITY.md).

## How this project is built

I'm building Hitchpost as an AI-led engineering project: I set the direction, make and record the decisions and review every change, with Claude Code as my engineering partner. The record:

- [System analysis and design](docs/sad/README.md): 37 documents (HP-SAD-00 to 36) from vision and business analysis through requirements, architecture, security, testing and operations to maintenance, also bound as a [PDF](docs/sad/Hitchpost-System-Analysis-and-Design.pdf). Frozen for the Phase 2 spike.
- [Concept](docs/concept.md): the idea and the notebook story that started it.
- [Build journey](docs/journey/README.md): key moments, phase by phase.
- [Decision records](docs/decisions/README.md): every major choice and why.
- [Audits](docs/audits/) and the [bug and fix log](docs/bugs.md): what reviews found, what broke and how it was fixed.

## License

[MIT](LICENSE) © 2026 Sanaullah Jannisar
