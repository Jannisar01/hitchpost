# Build journey

How Hitchpost went from a notebook page to production. I directed the build with Claude Code as my engineering partner. I set the product direction, made the calls and reviewed the work, and Claude did the implementation under that direction. Each entry records what happened, the choices made and why.

Related records:

- [Decision records](../decisions/README.md): every choice that matters, with its reasoning.
- [Bug and fix log](../bugs.md): what broke, why, and how it was fixed.

---

## 2026-11-08 · Phase 0: from notebook to repo

### Where it started

Two notebook pages. The first is the barber story: two people, two agents, and an approval gate between them. The second is the bigger idea. We connect agents to software, not to each other, and websites need to become customer-service agents listed in a public directory with ratings on top.

| Page 1: the barber journey                     | Page 2: the bigger picture                     |
| ---------------------------------------------- | ---------------------------------------------- |
| ![Notebook page 1](assets/notebook-page-1.jpg) | ![Notebook page 2](assets/notebook-page-2.jpg) |

### Key moments

- **Turned the sketches into a written concept** ([concept.md](../concept.md)) and a product and business brief ([insights.md](../insights.md)) before writing code.
- **Checked the landscape first.** My first sketch said "MCP, agent to agent." Looking closer, MCP connects an agent to its _tools_, and the agent-to-agent wire protocol already exists as A2A. That moved the project's value away from the protocol and onto discovery, trust and the approval gate. It was the most important finding of the day.
- **Set up the project like a real open-source product**: MIT license, contribution guide, CI, automated code review, branch rules and a decision log from the first commit.

### Choices made

| Decision                                                                               | Why                                                                  |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Build on A2A, use MCP for tools](../decisions/0003-build-on-a2a-and-mcp.md)           | Inventing a protocol is cost with no upside. The gaps are elsewhere. |
| [Approval gate is mandatory](../decisions/0007-human-approval-gate.md)                 | Trust is the product. No agent commits a human without a yes.        |
| [Barbers first](../decisions/0008-first-vertical-barbers.md)                           | Small, frequent, low-risk transactions. Fast learning.               |
| [TypeScript monorepo](../decisions/0002-typescript-monorepo.md)                        | One language across agents, directory and app. Official A2A JS SDK.  |
| [MIT, open source](../decisions/0004-mit-open-source.md)                               | A directory that wants to be a commons has to be open.               |
| [CI gates, AI review advises, human merges](../decisions/0005-ci-and-review-policy.md) | Fast feedback on every PR, final say stays with me.                  |
| [Walking skeleton first](../decisions/0009-walking-skeleton.md)                        | CI has something real to check from the first commit.                |
| [Working codename "Hitchpost"](../decisions/0006-working-codename.md)                  | Branding can wait. Renaming is one command.                          |

### Next

Phase 1: two agents talking over A2A on my machine.
