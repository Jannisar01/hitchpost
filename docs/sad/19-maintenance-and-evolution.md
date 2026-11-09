# HP-SAD-19 · Maintenance and evolution

| Field       | Value                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| Document ID | HP-SAD-19                                                                         |
| Version     | 1.2                                                                               |
| Status      | Baselined for Phase 2                                                             |
| Date        | 2026-11-09                                                                        |
| Owner       | Sanaullah Jannisar, product and engineering lead                                  |
| Conforms to | ISO/IEC/IEEE 14764 (software maintenance); ISO/IEC/IEEE 12207 maintenance process |

What happens after production: support, versioning, patching, the debt I'm carrying, how the docs stay true, and where the system goes after v1. Also how it ends, if it does. Values (P-) and phases come from [00 Document control](00-document-control.md#10-normative-parameters-and-phase-map).

## 1. Support model

This is the one support table for the package (P-17). [17 Transition plan](17-transition-plan.md) and [18 Deployment and operations](18-deployment-and-operations.md) link here instead of restating it.

**Severity and response targets (P-17).** This is the single severity table for the package; incident response in [18](18-deployment-and-operations.md) and the pilot rollback in [17](17-transition-plan.md) cite it and don't restate the definitions.

| Severity                    | Meaning                                                                                                                                       | First response                                                                                                          | Resolution target                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| SEV1                        | Any double booking or lost confirmed booking caused by Hitchpost; any booking without a logged approval; any security or personal-data breach | 1 hour, any time while any listing is live (none promised while pilot listings are paused, [17](17-transition-plan.md)) | Mitigate (rollback or pause) within 1 hour; fix with a test before resuming |
| SEV2                        | Service down or degraded, including an error rate on the booking path above the SLO for 1 hour; one shop's sync failing for more than 2 hours | 4 business hours                                                                                                        | Next patch release                                                          |
| SEV3                        | Minor, cosmetic or non-booking defect                                                                                                         | Acknowledged at triage                                                                                                  | Next release                                                                |
| Community issue (not a SEV) | Feature request, question, docs                                                                                                               | Triaged within 5 days                                                                                                   | Backlog; `good first issue` where possible                                  |
| Security report             | Private vulnerability reporting ([SECURITY.md](../../SECURITY.md))                                                                            | Acknowledged within 72 hours                                                                                            | Patched per P-16                                                            |

**Channels by audience:**

| Who                         | Channel                                          |
| --------------------------- | ------------------------------------------------ |
| Pilot barbers (Marcus)      | Direct line (phone or WhatsApp) during the pilot |
| People using the app (Dana) | In-app help, then email                          |
| Developers (Priya)          | GitHub issues and discussions                    |
| Security reporters          | Private vulnerability reporting                  |

## 2. Issue triage

Weekly triage. Every new issue gets a type label (`bug`, `enhancement`, `docs`, `security`) and, for defects, a severity from section 1. I use SEV labels rather than P0 to P3, so issue priorities don't collide with the P- parameter IDs.

## 3. Release cadence

- **Patch releases** as needed for fixes. Security fixes ship the same day they're ready.
- **Minor releases** every 4 to 6 weeks during active phases.
- **Major releases** only for breaking changes to the message contract or public APIs, announced at least one minor release ahead.

## 4. Message contract versioning and deprecation

The booking messages ([13](13-interfaces.md)) are a public contract other people's agents depend on (NFR-INT-01).

- **Versioning:** major versions only, declared on the agent card as an `AgentCapabilities.extensions` entry (`https://hitchpost.dev/ext/contract/v1`, `required: true`) from Phase 2, and listed in each message's `extensions`. There are no minor versions.
- **Additive changes** (new optional fields, new message kinds) keep the current version and need no deprecation.
- **Breaking changes** need a new major uri. **An old version stays supported for 6 months after the next one ships (P-18).**
- **Deprecation notice:** in release notes, in the directory listing of affected agents, and as a warning field in replies to old-version messages.
- **Contract fixtures** for every supported version stay in the test suite until that version is removed ([15](15-test-strategy.md)).
- **A2A spec upgrades** follow the SDK. The A2A v0.3 compatibility layer gets turned on only if real partners still speak v0.3.

## 5. Dependency and security patching

| What                        | How                                                                          | Cadence                                                                        |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| npm dependencies            | Dependabot PRs, dev tools grouped, through CI                                | Weekly; merge within 1 week                                                    |
| GitHub Actions              | Dependabot updates the SHA pins                                              | Weekly                                                                         |
| CVE in a runtime dependency | Patch release                                                                | P-16: critical within 48 hours; high within 7 days; others in the next release |
| Node runtime                | Stay on the active LTS; move to the next LTS within 3 months of its LTS date | Twice a year check                                                             |
| A2A SDK                     | Read release notes; upgrade in its own PR with the e2e tests                 | Each minor release                                                             |

## 6. Tech-debt register

Packages named below follow [10](10-architecture.md): `packages/e2e`, `packages/directory` (also hosts admin), `packages/app`, `packages/dashboard`, `packages/ratings`. Seeded from the [Phase 1 audit](../audits/2026-11-08-phase-1.md) and the ADR correction notes. Reviewed at the start of each phase.

| ID   | Debt                                                                                                                                                                        | Why it matters                                                             | Priority | Pay down by                                                                                                                                                           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Times are UTC only; shop hours are whole UTC hours, not minutes of the local day                                                                                            | Wrong slots for any real shop; no real booking happens before this is paid | High     | Phase 6, before the first real booking (ADR 0018: IANA zone per business, local slot grid, DST rules, UTC on the wire)                                                |
| D-02 | Package `exports` point at `.ts` source                                                                                                                                     | Breaks under copy installs, Docker, publishing                             | High     | Phase 6 (ADR 0016: compile step)                                                                                                                                      |
| D-03 | Offers aren't stored; no slot hold                                                                                                                                          | No approval binding (T-04)                                                 | High     | Phase 2 (ADR 0012, ADR 0013)                                                                                                                                          |
| D-04 | No auth or rate limits on agents                                                                                                                                            | Anyone who can reach the port can call it or lock slots                    | High     | Phase 2 for the holds cap and per-IP limit (P-07, P-08); Phase 6 for authentication (ADR 0017)                                                                        |
| D-05 | Client trusts the card's advertised URL; no SSRF block list or size cap                                                                                                     | SSRF once a hosted service reads directory URLs (T-13)                     | High     | Phase 3 (ADR 0015)                                                                                                                                                    |
| D-06 | Every invalid request gets the same rejection reason; unknown service looks like "no availability"                                                                          | Poor developer experience for other agent builders                         | Medium   | Phase 2                                                                                                                                                               |
| D-07 | End-to-end tests live in `my-agent`, which devDepends on `barber-agent`                                                                                                     | Becomes a cycle once the barber side needs my agent                        | Medium   | Phase 2 (move to `packages/e2e`)                                                                                                                                      |
| D-08 | Public agent URL comes from the bind address                                                                                                                                | Wrong URL when hosted                                                      | Medium   | Phase 6                                                                                                                                                               |
| D-09 | `cancelTask` is a no-op                                                                                                                                                     | Breaks the SDK contract once Tasks are used                                | Medium   | Phase 2                                                                                                                                                               |
| D-10 | In-memory task store and book                                                                                                                                               | All state lost on restart                                                  | High     | Phase 2: SQLite on the business side (SDK `DatabaseTaskStore` plus offers, bookings, audit), JSONL on the personal side (NFR-REL-02); Phase 6: Postgres `slot_claims` |
| D-11 | `@a2a-js/sdk` version declared in three packages                                                                                                                            | Drift between packages                                                     | Low      | Phase 2 (pnpm catalog)                                                                                                                                                |
| D-12 | No `pnpm audit` or release-age delay in CI                                                                                                                                  | Slower to spot bad dependencies                                            | Low      | Phase 6                                                                                                                                                               |
| D-13 | Claude review runs on docs-only pushes                                                                                                                                      | API cost                                                                   | Low      | When cost shows up                                                                                                                                                    |
| D-14 | Businesses without a website are verified in person (pilot only, see 17)                                                                                                    | Doesn't scale past one neighbourhood                                       | Medium   | Before expanding beyond the pilot area                                                                                                                                |
| D-15 | The shop's book configuration isn't validated at load: an unparseable booked `start` silently stops blocking its slot; hours, service uniqueness and currency are unchecked | Silent double-booking risk from a bad config                               | High     | Phase 2 (FR-BOOK-12, WP-2.10): validate at load and refuse to start on an invalid book                                                                                |

New debt gets a row when it's created, with the reason it was accepted. That's the same rule as the `shortcut:` comments in code.

## 7. Documentation upkeep

- **Decision records:** a new ADR for every choice that's expensive to reverse. Old ones are never rewritten; dated status or correction notes are added instead, as done after the audit.
- **Build journey:** one entry per phase or major event, written when it happens.
- **Bug log:** every real bug, with root cause and prevention. PR template checkbox.
- **This SA&D set:** each phase's PR updates the status labels (Phase N to Built) in the docs it touches. Before each release I check that nothing says Built that isn't. Any value or phase used in more than one document changes in [00](00-document-control.md#10-normative-parameters-and-phase-map) first and is cited by its P-ID; the scripted consistency check covers IDs and links, not values, so that rule is what keeps values consistent.
- **Audits:** before Phase 2 ships, before production, then yearly.

## 8. Metrics review

| Cadence        | Review                                                                                                                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weekly (pilot) | North star: weekly human-approved bookings that were honored. Counter-metrics: first-offer rejection rate, median time to approve, booking errors, reports per 100 interactions, repeat use within 60 days.                   |
| Monthly        | SLOs and error budget, API and hosting cost, open SEV1 and SEV2 count, Dependabot backlog, mutation test results.                                                                                                             |
| Per phase      | Assumption tests and risks R-01 to R-12 from the [business case](03-business-case.md): continue, change or stop. Progress against the six [v1 release criteria](01-vision-and-scope.md#8-v1-release-criteria-end-of-phase-6). |
| Yearly         | Security re-audit, hosting cost review, roadmap reset.                                                                                                                                                                        |

## 9. Roadmap beyond v1

| Theme                             | What                                                                                                                                                                                              | Depends on                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| More verticals                    | Salons, trades, restaurants, then clinics last (privacy rules). Generalise the appointment model only when the second vertical arrives ([ADR 0008](../decisions/0008-first-vertical-barbers.md)). | Pilot results                 |
| Language-model front end          | Turn "Thursday after work" into a request; summarise offers. Under the injection rules in [12](12-security-and-privacy.md#3-prompt-injection-once-a-language-model-is-added).                     | Phase 2 gate                  |
| Real booking systems              | MCP connectors to the booking tools barbers actually use, replacing the in-memory book ([ADR 0011](../decisions/0011-in-memory-appointment-book.md))                                              | Barber interviews, API access |
| Payments and deposits (not in v1) | Deposits for no-show protection, through a payment provider, never stored by Hitchpost. Brings PCI and consumer-protection scope.                                                                 | Legal review                  |
| Third-party assistants            | Any A2A-speaking personal assistant can use the directory and the gate                                                                                                                            | Directory API stability       |
| Federation                        | Other directories can mirror or peer with Hitchpost listings, so no single operator owns the commons ([ADR 0004](../decisions/0004-mit-open-source.md))                                           | Signed cards, stable contract |

## 10. Sunset and end of life

If the pilot's kill criteria are met ([03](03-business-case.md)), or I stop maintaining the project:

1. **Announce at least 90 days ahead** to listed businesses, app users and in the README.
2. **Freeze new listings**, keep existing bookings working until the date.
3. **Export:** every business gets its listing and booking data as JSON; every person gets theirs.
4. **Delete** personal data after the export window, and say so publicly.
5. **Archive the repository** with a final journey entry on what was learned. The code stays MIT-licensed, so anyone can fork and run it.
6. **Hand over** the directory domain and data to a willing community maintainer if one exists, with business consent.

## Revision history

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                | Author      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 0.1     | 2026-11-08 | First draft                                                                                                                                                                                                                                                                                                                                                                           | S. Jannisar |
| 1.0     | 2026-11-09 | Baselined: renumbered into lifecycle order, formal document control, standards conformance                                                                                                                                                                                                                                                                                            | S. Jannisar |
| 1.1     | 2026-11-09 | Remediation after independent review: one support table by severity (P-17) that 17 and 18 link to; SEV labels replace P0 to P3; contract versioning via `AgentCapabilities.extensions`, major only (P-18); patching per P-16; D-01 time zones moved to Phase 6; D-04 and D-10 brought into Phase 2 where the plan now pays them; new D-15 (book configuration validation, FR-BOOK-12) | S. Jannisar |
| 1.2     | 2026-11-09 | Second remediation after regrade: this is now the single SEV table (precise SEV1 and SEV2 triggers, no SEV1 cover during the pilot holiday pause); 17 and 18 cite it                                                                                                                                                                                                                  | S. Jannisar |
