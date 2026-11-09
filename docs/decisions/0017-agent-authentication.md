# 0017. Agent-to-agent authentication and signing

- **Date:** 2026-11-09
- **Status:** Proposed. Decide in Phase 5, needed by WP-6.2 (Phase 6).

## Context

Until Phase 6, authority comes from server-minted bearer secrets (`offerId`, `bookingToken`, ADR 0012) and senders are identified only by IP. Production needs to know which agent is speaking, to rate-limit per identity (P-08), to stop impersonation in the directory (T-15) and to sign interaction records (Phase 5 uses matching audit hashes instead, see 07).

## Options

- **Signed agent cards** (A2A `signatures`: JWS over the JCS, RFC 8785, canonical card) with keys published as a JWKS at a URL registered on the listing.
- **Per-contact tokens** issued when a person adds a business as a contact, sent as bearer tokens on each call.
- **Mutual TLS** between agents.

## Decision the design currently assumes

Signed cards plus per-contact tokens. For hosted agents the platform holds one key per tenant in a managed KMS. Scheduled rotation keeps the old key valid for verification for 30 days; a suspected compromise removes the key from the JWKS at once and flags the listing. Interaction records get signatures from Phase 6. Note that the SDK ships the `AgentCardSignature` type but no signing or verification code, so both are ours to build and test.

## Consequences

Real identity for rate limits and reviews, at the cost of key management. mTLS stays an option for business-to-business integrations later.
