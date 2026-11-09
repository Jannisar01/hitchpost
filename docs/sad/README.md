# System analysis and design

The full lifecycle documentation for Hitchpost, from vision to running it in production and maintaining it afterwards. It starts from what exists today (Phase 1 plus the audit fixes) and designs forward to production and beyond.

Every document marks what is **Built** (in the code now, with a path), **Phase N** (planned for that phase) or **Later** (after production). Nothing planned is described as if it exists.

## Documents

| #   | Document                                                     | Answers                                                 | Lifecycle stage  |
| --- | ------------------------------------------------------------ | ------------------------------------------------------- | ---------------- |
| 01  | [Vision and scope](01-vision-and-scope.md)                   | Why build this, for whom, what's in and out             | Vision           |
| 02  | [Business case](02-business-case.md)                         | Market, competition, model, assumptions to test, risks  | Analysis         |
| 03  | [Stakeholders and personas](03-stakeholders-and-personas.md) | Who uses or is affected by it, and their journeys       | Analysis         |
| 04  | [Requirements specification](04-requirements.md)             | What the system must do and how well, with traceability | Analysis         |
| 05  | [Use cases](05-use-cases.md)                                 | Step-by-step flows, main and alternate                  | Analysis         |
| 06  | [System architecture](06-architecture.md)                    | Context, containers, components, sequences, deployment  | Design           |
| 07  | [Data design](07-data-design.md)                             | Domain model, storage, retention, privacy classes       | Design           |
| 08  | [Security and privacy](08-security-and-privacy.md)           | Threat model, controls, privacy, abuse                  | Design           |
| 09  | [Interface design](09-interfaces.md)                         | Agent message contract, directory API, app screens      | Design           |
| 10  | [Test strategy](10-test-strategy.md)                         | How each requirement is proven, at each level           | Build and verify |
| 11  | [Deployment and operations](11-deployment-and-operations.md) | Environments, CI/CD, hosting, observability, incidents  | Release and run  |
| 12  | [Maintenance and evolution](12-maintenance-and-evolution.md) | Support, versioning, patching, tech debt, life after v1 | Post-production  |

Related records outside this folder: [decision records](../decisions/README.md), [build journey](../journey/README.md), [bug log](../bugs.md), [audits](../audits/).

## Shared conventions

These keep the documents consistent. When one document refers to another's item, it uses these IDs.

### Phases

| Phase | Name          | Outcome                                                                  |
| ----- | ------------- | ------------------------------------------------------------------------ |
| 0     | Foundation    | Repo, license, CI, review, decision log                                  |
| 1     | Agent line    | Two agents exchange typed messages over A2A                              |
| 2     | Approval gate | Offer, human yes or no, booking, audit log on both sides                 |
| 3     | Directory     | Businesses register agents; people and agents search them                |
| 4     | Client app    | WhatsApp-style app with agents as contacts and a built-in personal agent |
| 5     | Ratings       | Reviews from verified interactions                                       |
| 6     | Production    | Hosting, auth, monitoring, abuse limits, real barbers in one area        |
| Later | Evolution     | More verticals, language-model front end, payments, federation           |

### Requirement IDs

- Functional: `FR-<AREA>-<nn>`. Areas: `MSG` (agent messaging), `GATE` (approval), `BOOK` (booking lifecycle), `DIR` (directory), `APP` (client app), `RATE` (ratings), `ADMIN` (operator and moderation).
- Non-functional: `NFR-<AREA>-<nn>`. Areas: `SEC`, `PRIV`, `PERF`, `REL` (reliability), `OBS` (observability), `A11Y`, `MAINT`, `INT` (interoperability).
- Use cases: `UC-<nn>`. Risks: `R-<nn>`. Assumptions: `A-<nn>`. Threats: `T-<nn>`.

### Use case list

| ID    | Use case                                      | Phase     |
| ----- | --------------------------------------------- | --------- |
| UC-01 | Ask a business agent for availability         | 1 (Built) |
| UC-02 | Approve an offer and book it                  | 2         |
| UC-03 | Decline an offer or ask for another           | 2         |
| UC-04 | Reschedule or cancel a booking                | 2         |
| UC-05 | Register a business agent in the directory    | 3         |
| UC-06 | Find a business agent                         | 3         |
| UC-07 | Add an agent as a contact and chat in the app | 4         |
| UC-08 | Rate an interaction                           | 5         |
| UC-09 | Report an abusive or fake agent               | 5         |
| UC-10 | Moderate the directory and handle reports     | 6         |

### Personas

| Persona    | Role                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| **Dana**   | Customer. Busy professional who books a haircut every 3 to 4 weeks, usually late. |
| **Marcus** | Barber and shop owner, 2 chairs, uses a booking app, misses calls while cutting.  |
| **Priya**  | Developer who builds or runs an A2A agent and wants it listed and trusted.        |
| **Sam**    | Operator and moderator of the Hitchpost directory (initially the maintainer).     |

### Writing rules

- First person for the owner's decisions ("I chose"), plain English, short sentences.
- Every factual market claim is dated and sourced, or marked "to verify".
- Diagrams in Mermaid so they render on GitHub and stay editable.
- Link to code for anything Built, and to the ADR for any decision.
