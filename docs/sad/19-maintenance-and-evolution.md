# 12. Maintenance and evolution

What happens after production: support, versioning, patching, the debt I'm carrying, how the docs stay true, and where the system goes after v1. Also how it ends, if it does.

## Support model

| Who                         | Channel                                                            | Response target             |
| --------------------------- | ------------------------------------------------------------------ | --------------------------- |
| Pilot barbers (Marcus)      | Direct line (phone or WhatsApp) during the pilot                   | Same business day           |
| People using the app (Dana) | In-app help, then email                                            | 2 business days             |
| Developers (Priya)          | GitHub issues and discussions                                      | Triage within 7 days        |
| Security reporters          | Private vulnerability reporting ([SECURITY.md](../../SECURITY.md)) | Acknowledge within 72 hours |

## Issue triage

Weekly triage. Every new issue gets a type label (`bug`, `enhancement`, `docs`, `security`) and a priority.

| Priority | Meaning                                 | Target for an open-source project with one maintainer |
| -------- | --------------------------------------- | ----------------------------------------------------- |
| P0       | Wrong or lost bookings, security breach | Fix or mitigate within 24 hours                       |
| P1       | Feature broken for many users           | Next patch release, within 1 week                     |
| P2       | Bug with a workaround                   | Next minor release                                    |
| P3       | Nice to have                            | Backlog; `good first issue` where possible            |

## Release cadence

- **Patch releases** as needed for fixes. Security fixes ship the same day they're ready.
- **Minor releases** every 4 to 6 weeks during active phases.
- **Major releases** only for breaking changes to the message contract or public APIs, announced at least one minor release ahead.

## Message contract versioning and deprecation

The booking messages ([09](09-interfaces.md)) are a public contract other people's agents depend on (NFR-INT-01).

- **Versioning:** `hitchpost/<major>` (`hitchpost/1` today), carried in message metadata from Phase 2.
- **Additive changes** (new optional fields, new message kinds) are minor and need no deprecation.
- **Breaking changes** need a new major. **An old version stays supported for 6 months after the next one ships.**
- **Deprecation notice:** in release notes, in the directory listing of affected agents, and as a warning field in replies to old-version messages.
- **Contract fixtures** for every supported version stay in the test suite until that version is removed ([10](10-test-strategy.md)).
- **A2A spec upgrades** follow the SDK. The A2A v0.3 compatibility layer gets turned on only if real partners still speak v0.3.

## Dependency and security patching

| What                                         | How                                                                          | Cadence                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| npm dependencies                             | Dependabot PRs, dev tools grouped, through CI                                | Weekly; merge within 1 week              |
| GitHub Actions                               | Dependabot updates the SHA pins                                              | Weekly                                   |
| Critical or high CVE in a runtime dependency | Patch release                                                                | Within 7 days (critical within 48 hours) |
| Node runtime                                 | Stay on the active LTS; move to the next LTS within 3 months of its LTS date | Twice a year check                       |
| A2A SDK                                      | Read release notes; upgrade in its own PR with the e2e tests                 | Each minor release                       |

## Tech-debt register

Packages named below follow [06](06-architecture.md): `packages/e2e`, `packages/directory` (also hosts admin), `packages/app`, `packages/ratings`. Seeded from the [Phase 1 audit](../audits/2026-11-08-phase-1.md) and the ADR correction notes. Reviewed at the start of each phase.

| ID   | Debt                                                                                               | Why it matters                                         | Priority | Pay down by                                                      |
| ---- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------- | ---------------------------------------------------------------- |
| D-01 | Times are UTC only; shop hours aren't in local time                                                | Wrong slots for any real shop                          | High     | Phase 3 (ADR 0018: IANA time zone per business, UTC on the wire) |
| D-02 | Package `exports` point at `.ts` source                                                            | Breaks under copy installs, Docker, publishing         | High     | Phase 6 (ADR 0016: compile step)                                 |
| D-03 | Offers aren't stored; no slot hold                                                                 | No approval binding (T-04)                             | High     | Phase 2 (ADR 0012, ADR 0013)                                     |
| D-04 | No auth or rate limits on agents                                                                   | Anyone who can reach the port can call it              | High     | Phase 6 (ADR 0017)                                               |
| D-05 | Client trusts the card's advertised URL; no SSRF block list or size cap                            | SSRF once a hosted service reads directory URLs (T-13) | High     | Phase 3 (ADR 0015)                                               |
| D-06 | Every invalid request gets the same rejection reason; unknown service looks like "no availability" | Poor developer experience for other agent builders     | Medium   | Phase 2                                                          |
| D-07 | End-to-end tests live in `my-agent`, which devDepends on `barber-agent`                            | Becomes a cycle once the barber side needs my agent    | Medium   | Phase 2 (move to `packages/e2e`)                                 |
| D-08 | Public agent URL comes from the bind address                                                       | Wrong URL when hosted                                  | Medium   | Phase 6                                                          |
| D-09 | `cancelTask` is a no-op                                                                            | Breaks the SDK contract once Tasks are used            | Medium   | Phase 2                                                          |
| D-10 | In-memory task store and book                                                                      | All state lost on restart                              | Medium   | Phase 3 (directory), Phase 6 (agents)                            |
| D-11 | `@a2a-js/sdk` version declared in three packages                                                   | Drift between packages                                 | Low      | Phase 2 (pnpm catalog)                                           |
| D-12 | No `pnpm audit` or release-age delay in CI                                                         | Slower to spot bad dependencies                        | Low      | Phase 6                                                          |
| D-13 | Claude review runs on docs-only pushes                                                             | API cost                                               | Low      | When cost shows up                                               |

New debt gets a row when it's created, with the reason it was accepted. That's the same rule as the `shortcut:` comments in code.

## Documentation upkeep

- **Decision records:** a new ADR for every choice that's expensive to reverse. Old ones are never rewritten; dated status or correction notes are added instead, as done after the audit.
- **Build journey:** one entry per phase or major event, written when it happens.
- **Bug log:** every real bug, with root cause and prevention. PR template checkbox.
- **This SA&D set:** each phase's PR updates the status labels (Phase N to Built) in the docs it touches. Before each release I check that nothing says Built that isn't.
- **Audits:** before Phase 2 ships, before production, then yearly.

## Metrics review

| Cadence        | Review                                                                                                                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weekly (pilot) | North star: weekly human-approved bookings that were honored. Counter-metrics: first-offer rejection rate, median time to approve, booking errors, reports per 100 interactions, repeat use within 60 days.                 |
| Monthly        | SLOs and error budget, API and hosting cost, open P0/P1 count, Dependabot backlog, mutation test results.                                                                                                                   |
| Per phase      | Assumption tests and risks R-01 to R-12 from the [business case](02-business-case.md): continue, change or stop. Progress against the six [v1 release criteria](01-vision-and-scope.md#v1-release-criteria-end-of-phase-6). |
| Yearly         | Security re-audit, hosting cost review, roadmap reset.                                                                                                                                                                      |

## Roadmap beyond v1

| Theme                             | What                                                                                                                                                                                              | Depends on                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| More verticals                    | Salons, trades, restaurants, then clinics last (privacy rules). Generalise the appointment model only when the second vertical arrives ([ADR 0008](../decisions/0008-first-vertical-barbers.md)). | Pilot results                 |
| Language-model front end          | Turn "Thursday after work" into a request; summarise offers. Under the injection rules in [08](08-security-and-privacy.md#prompt-injection-once-a-language-model-is-added).                       | Phase 2 gate                  |
| Real booking systems              | MCP connectors to the booking tools barbers actually use, replacing the in-memory book ([ADR 0011](../decisions/0011-in-memory-appointment-book.md))                                              | Barber interviews, API access |
| Payments and deposits (not in v1) | Deposits for no-show protection, through a payment provider, never stored by Hitchpost. Brings PCI and consumer-protection scope.                                                                 | Legal review                  |
| Third-party assistants            | Any A2A-speaking personal assistant can use the directory and the gate                                                                                                                            | Directory API stability       |
| Federation                        | Other directories can mirror or peer with Hitchpost listings, so no single operator owns the commons ([ADR 0004](../decisions/0004-mit-open-source.md))                                           | Signed cards, stable contract |

## Sunset and end of life

If the pilot's kill criteria are met ([02](02-business-case.md)), or I stop maintaining the project:

1. **Announce at least 90 days ahead** to listed businesses, app users and in the README.
2. **Freeze new listings**, keep existing bookings working until the date.
3. **Export:** every business gets its listing and booking data as JSON; every person gets theirs.
4. **Delete** personal data after the export window, and say so publicly.
5. **Archive the repository** with a final journey entry on what was learned. The code stays MIT-licensed, so anyone can fork and run it.
6. **Hand over** the directory domain and data to a willing community maintainer if one exists, with business consent.
