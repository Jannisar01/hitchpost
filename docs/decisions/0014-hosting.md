# 0014. Hosting: one container platform plus managed Postgres, a subdomain per tenant

- **Date:** 2026-11-09
- **Status:** Proposed. Decide in Phase 3, needed by WP-6.1 (Phase 6).

## Context

v1 runs a directory, a ratings service, a dashboard, hosted business agents for shops without their own server, and Postgres. It's run by one person, so operational load matters more than raw scale. Origin verification (BR-12) needs every hosted business agent on its own origin, and RFC 8615 allows `.well-known` only at the origin root.

## Options

The options and their scoring are in [10 Architecture](../sad/10-architecture.md) (deployment view): A, one container platform plus managed Postgres; B, serverless functions plus a hosted database; C, a self-managed VM.

## Decision the design currently assumes

Option A in one region near the pilot area. Hosted business agents each get their own subdomain (`<slug>.agents.hitchpost.dev`). Postgres holds directory, offers, bookings (`slot_claims` with a range exclusion constraint), audit and ratings. Backups and retention follow P-11 to P-15.

## Consequences

One platform to learn and pay for, and wildcard TLS for the agents' subdomains. To confirm before deciding: the cost estimate in 16 against real quotes, and that the platform supports wildcard subdomains with automatic certificates.
