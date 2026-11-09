# 0001. Record decisions as short ADRs

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

This project is built in the open and also serves as a portfolio of how I lead a build. Code shows _what_ was done. It rarely shows _why_, or which options were turned down.

## Decision

Every choice that would be expensive to reverse, or that someone would reasonably question, gets a numbered Architecture Decision Record in `docs/decisions/`. Records are short: context, decision, alternatives, consequences.

## Alternatives considered

- **Wiki or Notion:** drifts away from the code and isn't versioned with it.
- **Long design doc:** goes stale and nobody reads it end to end.

## Consequences

A bit of writing per decision. In return, anyone can trace why the project looks the way it does, and I can defend each choice.
