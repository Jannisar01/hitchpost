# 0015. The directory verifies origin; clients enforce the card's URL origin

- **Date:** 2026-11-09
- **Status:** Proposed. Decide by M-04 (Phase 3 gate).

## Context

A directory listing points to an agent card, and the card names the URL its interface lives at. If either can point anywhere, a listed business can steer clients to another host (T-15, FR-DIR-03), and a hosted shop could pose as another.

## Options

- **Directory-only check** at listing time.
- **Client-only check** on every lookup.
- **Both:** the directory proves the business controls the origin (well-known token or DNS TXT) when listing and whenever `cardUrl` changes; every client refuses a card whose interface URL isn't on the listing's verified origin.

## Decision the design currently assumes

Both. Verification is by well-known token or DNS TXT (FR-DIR-01). Clients compare the card's `supportedInterfaces` URL origin with the listing's `verifiedOrigin` and refuse a mismatch. Redirects are refused on card fetches (already Built in my agent).

## Consequences

A listing can't redirect clients elsewhere even if the directory is fooled once. Hosted agents need one subdomain each (ADR 0014) so their origins differ.
