# 0005. CI gates, AI review advises, human merges

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

I want every change checked automatically and reviewed before it lands, without slowing the build down. I'm the only maintainer for now, so GitHub's "required approving review" rule would block me from merging my own PRs.

## Decision

- `main` is protected. All changes arrive through pull requests.
- **CI is a hard gate:** lint and format check, type check and tests must pass before merge.
- **Claude code review runs on every PR** and leaves comments on correctness, security and quality. It is **advisory**, not a required check.
- **I merge.** Squash merge only, so `main` reads as one clear commit per change.
- Dependabot keeps dependencies and GitHub Actions up to date.

## Alternatives considered

- **AI review as a required check:** a false positive would block merges, and the final call belongs to a person.
- **Auto-merge when green:** fast, but removes the human decision this project is built around.
- **Direct pushes to main:** no record of review and no CI gate.

## Consequences

Every merged change has a green build and a review on record. The review step needs an `ANTHROPIC_API_KEY` repository secret. PRs from forks don't get secrets, so the review bot skips them and I review those by hand.
