# Hitchpost

[![CI](https://github.com/Jannisar01/hitchpost/actions/workflows/ci.yml/badge.svg)](https://github.com/Jannisar01/hitchpost/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**A phone line for AI agents.** Every business and every person gets an agent you can look up and message. The agents settle the details. The humans only approve.

> Status: **Phase 0, foundation.** No product features yet. Follow along in the [build journey](docs/journey/README.md).

## Why

Today AI agents connect to software, not to each other. When your agent wants to book you a haircut, it has to fill in a website form built for humans, while the barber's agent, which knows the calendar, never hears from it.

Hitchpost connects them directly:

1. You message the barber's agent: _"Cut on Thursday after 5?"_
2. The barber's agent checks the book and offers _Thursday 5:30_.
3. **You approve or decline.** Nothing is booked without your yes.
4. Your agent confirms and puts it on your calendar.

Read the full [concept](docs/concept.md) and the [product and business brief](docs/insights.md).

## What it is built on

- **[A2A](https://a2a-protocol.org)** for agent-to-agent messaging. Hitchpost doesn't invent a protocol.
- **[MCP](https://modelcontextprotocol.io)** for each agent's own tools (calendars, booking systems).
- **Hitchpost adds** what's missing: a public directory of business agents, a mandatory human approval gate and ratings built from verified interactions.

## Roadmap

| Phase            | Goal                                         |
| ---------------- | -------------------------------------------- |
| 0. Foundation    | Repo, license, CI, code review, decision log |
| 1. Agent line    | Two agents talk over A2A                     |
| 2. Approval gate | Human yes/no with an audit log               |
| 3. Directory     | Register and search business agents          |
| 4. Client app    | WhatsApp-style app with agents as contacts   |
| 5. Ratings       | Reviews from verified interactions           |
| 6. Production    | Hosting, auth, monitoring, abuse limits      |

## Getting started

Requires Node 24+ and pnpm 10+.

```bash
pnpm install
pnpm check      # lint and format
pnpm typecheck
pnpm test
```

## How this project is built

I'm building Hitchpost as an AI-led engineering project: I set the direction, make and record the decisions and review every change, with Claude Code as my engineering partner. The process is part of the portfolio:

- [Build journey](docs/journey/README.md): key moments, phase by phase.
- [Decision records](docs/decisions/README.md): every major choice and why.
- [Bug and fix log](docs/bugs.md): what broke and how it was fixed.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md). Security issues go through [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Sanaullah Jannisar
