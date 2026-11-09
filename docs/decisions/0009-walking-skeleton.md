# 0009. Start with a walking skeleton

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

CI and code review are only proven when they run on real code. Setting them up after the first features means the first features land unchecked.

## Decision

Phase 0 ships a minimal `@hitchpost/core` package with one function and one test, so lint, type check, tests and review all run green from the first commit. Real product code replaces it in Phase 1.

## Consequences

A tiny bit of throwaway code. In return, the pipeline is known to work before anything important depends on it.

## Status note (2026-11-08)

The placeholder `canCommit` stayed past Phase 1 and was removed after the Phase 1 audit, because it looked like an approval gate that didn't exist.
