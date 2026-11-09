# 0019. Service architecture: a modular monolith with separate agent hosts

- **Date:** 2026-11-09
- **Status:** Accepted

## Context

Hitchpost is a network of agent lines between people and businesses. The design names eight bounded contexts (agent line and identity, booking, approval, directory, reputation, notification, operations and moderation, analytics). The question is how many deployable services those contexts become.

The constraints are specific. One owner works about 15 hours a week. The pilot carries under one request per second. A bad deploy must not take every business offline at once (the SRE panel, TO-5 in 11). Data that belongs to one context must not be read casually by another (the database panel found one shared Postgres with no roles). And the design has to stay extractable: if a context outgrows the process, splitting it out must not mean a rewrite.

## Decision

Three deployable units, each internally modular:

1. **Agent host:** runs business agent lines. Each business agent line is its own A2A handler with its own data scope (its own SQLite file in Phase 2; row-level security per business in Phase 6). One host process can serve many lines; a line can be moved to its own process without code changes.
2. **App backend:** runs personal agent lines, the App API for the client, and notifications.
3. **Platform service:** directory, reputation, operations and moderation, and analytics, as separate modules in one process.

Rules that make this a modular monolith rather than a big ball of mud:

- Each context owns a schema (module) and a database role. No context reads another context's tables; it calls that context's in-process API or consumes its events.
- Events between contexts go through a transactional outbox in the producer's database, written in the same transaction as the state change, and are delivered at least once to idempotent consumers.
- Every context has written extraction triggers (in [26 Service architecture](../sad/26-service-architecture.md)). When a trigger fires, that context becomes its own service.

## Alternatives considered

- **Microservices per context from day one.** Strongest isolation and independent deploys, but eight services, eight pipelines and network failure modes between them for one part-time owner. Weighted score 3.35 against 3.90 for the choice (26 section 5).
- **A single modular monolith, agents included.** Cheapest to run (score 3.60), but one bad deploy or one runaway business agent takes every line down, and per-business data isolation depends only on query discipline.

## Consequences

- Operational load stays close to a monolith: three deployables, one Postgres cluster in Phase 6.
- Business agent lines fail independently of the platform, and can be isolated further one line at a time.
- Cross-context calls are in-process today, so they are fast but can couple modules if the rules slip. `pnpm docs:check` cannot enforce this; a dependency rule in the lint step (module boundaries) is needed when the platform service is built (Phase 3).
- The outbox adds a table and a relay loop per producing context, in exchange for no lost events and no distributed transactions.
