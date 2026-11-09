# 0002. TypeScript monorepo with pnpm

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

Hitchpost has several parts that must share types: the agents, the directory service and the client app. A message shape defined once should be checked everywhere it is used.

## Decision

One repository, TypeScript everywhere, pnpm workspaces, packages under `packages/`. Node 24 LTS. Biome for lint and format, the built-in `node:test` runner for tests.

## Alternatives considered

- **Python backend + separate web front end:** strong AI ecosystem, but two languages and duplicated types at the boundary where bugs live.
- **Separate repos per service:** more ceremony, and cross-cutting changes need several PRs.
- **ESLint + Prettier:** works, but two tools and more config. Biome does both in one fast binary.
- **Jest/Vitest:** fine tools, but Node's built-in runner covers what is needed with zero dependencies. Revisit if the client app needs a DOM test environment.

## Consequences

One toolchain to learn and run in CI. The official A2A JavaScript SDK fits directly. If a heavy ML piece shows up later it can live as a separate Python service behind A2A, which is exactly what the protocol is for.
