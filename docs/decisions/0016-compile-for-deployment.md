# 0016. Compile packages for deployment

- **Date:** 2026-11-09
- **Status:** Proposed. Decide by WP-6.1 (Phase 6).

## Context

Packages export `.ts` source and Node runs it by stripping types. That works in development only because pnpm's workspace symlinks resolve outside `node_modules`; Node refuses to strip types inside `node_modules` (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`), so a copy-style install, `pnpm deploy` or publishing would fail (debt item in 19).

## Options

- **Compile with `tsc`** (emit, `rewriteRelativeImportExtensions`) into `dist/` for deployment; keep running `.ts` directly in development.
- **Bundle** each service with a bundler into one file.
- **Keep running source** and deploy the whole workspace with symlinks.

## Decision the design currently assumes

Compile with `tsc` for deployment images; development and tests keep running source. The constraint `erasableSyntaxOnly` stays, so source and output never diverge in behaviour.

## Consequences

One build step in the deploy pipeline and `exports` conditions for `development` and `default`. Must be confirmed against the TypeScript version in use at the time (TypeScript 7 has no stable JS API, which doesn't affect `tsc` emit).
