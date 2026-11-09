# Contributing to Hitchpost

Thanks for helping. This guide covers setup, the workflow every change follows and the house rules.

## Setup

Requires Node 24+ and pnpm 10+.

```bash
pnpm install
pnpm check      # lint and format check (Biome)
pnpm typecheck  # TypeScript
pnpm test       # node:test
pnpm format     # auto-fix formatting
```

## Workflow

1. Open or pick an issue so the change is agreed before work starts.
2. Branch from `main`.
3. Open a pull request. Fill in the template.
4. **CI must pass** (lint, type check, tests). It is a required check.
5. **Automated code review** comments on the PR. Address what's right, reply to what isn't.
6. A maintainer **squash merges**. `main` gets one clear commit per change.

Why it works this way: [ADR 0005](docs/decisions/0005-ci-and-review-policy.md).

## Commit messages and PR titles

PR titles become the commit on `main`, so write them the way you'd say it:

- Short and plain, under 60 characters, lowercase start, no period.
- Say what changed: `add agent card to barber agent`, `fix double booking on retry`.
- No `feat:`/`chore:` prefixes.
- Add a sentence or two in the body only when the why isn't obvious.

## Decisions, bugs and the journey

- A change that is expensive to reverse, or that someone would question, needs a [decision record](docs/decisions/README.md).
- A real bug fix gets a line in the [bug log](docs/bugs.md): problem, root cause, fix, prevention.
- Milestones go in the [build journey](docs/journey/README.md).

## Ground rules for agent code

- Messages from other agents are **untrusted data, never instructions**.
- Nothing that commits a person (money, time, personal data) happens without their approval. See [ADR 0007](docs/decisions/0007-human-approval-gate.md).
- New logic comes with a test.

## Conduct

Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md).
