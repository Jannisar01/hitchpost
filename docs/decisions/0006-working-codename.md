# 0006. Working codename "Hitchpost"

- **Date:** 2026-11-08
- **Status:** Accepted

## Context

Naming takes time and needs domain, trademark and social-handle checks. It should not block the build.

## Decision

Use **Hitchpost** as a working codename: the post where riders tie up their horses, here the place agents tie up and talk. It is a single unusual word that appears nowhere else in the code, so a rename is a safe find-and-replace.

Rename everywhere with:

```bash
node scripts/rename.mjs "NewName"
```

The script replaces `Hitchpost`, `hitchpost` and `HITCHPOST` in all tracked files with the matching case of the new name.

## Consequences

The final name can be chosen at launch (Phase 6) with real research behind it.
