---
sidebar_position: 6
title: Migrating from v1
---

# Migrating from v1 to v2

v2 is a full TypeScript rewrite with zero runtime dependencies. The API names
are unchanged (`generateSalt`, `generateVerifier`, `calculateSRP6Verifier`,
`isSalt`), but there are behavioral breaking changes.

## Breaking changes

### Verifiers are always 32 bytes (bug fix)

v1 had a hex-padding bug: for **~12% of salts** it produced a short or
corrupted verifier that TrinityCore would reject. v2 always emits exactly
32 zero-padded little-endian bytes.

:::info If you stored v1 verifiers

Any v1 verifier shorter than 32 bytes was invalid for TrinityCore anyway —
those accounts could never log in from the game client. Affected users need a
password reset (regenerate salt + verifier with v2).

:::

### ASCII-only uppercasing (bug fix)

v1 used JavaScript's full-Unicode `toUpperCase()`. TrinityCore only
uppercases ASCII `a–z`. Passwords containing `ñ`, accents, Cyrillic, etc. now
produce different — **TrinityCore-correct** — verifiers.

### `joindate` is a native `Date`

v1 returned a `dayjs` instance; v2 returns a plain `Date`. If you passed
`joindate` to a SQL driver, nothing changes. If you called dayjs methods on
it, wrap it yourself: `dayjs(result.joindate)`.

### Stricter input validation

| Input | v1 | v2 |
|---|---|---|
| salt | any Buffer | must be exactly 32 bytes (`INVALID_SALT_LENGTH`) |
| identify / password | anything with `toUpperCase` | non-empty strings (`INVALID_CREDENTIALS_FORMAT`) of ≤ 16 chars (`CREDENTIALS_TOO_LONG`) |

### Constant-time comparison

`isEqual` now uses `crypto.timingSafeEqual` instead of `Buffer.compare`.
Same signature, same semantics, no timing side channel.

## New in v2

- [`verifySRP6`](/api#verifysrp6) — one-call login check
- Exported constants: `N`, `g`, `HASH_ALGORITHM`, `SALT_LENGTH`,
  `VERIFIER_LENGTH`, `MAX_ACCOUNT_LENGTH`, `MAX_PASSWORD_LENGTH`
- `Srp6Error` with machine-readable `type` and standard `cause`
- TypeScript types: `Srp6Credentials`, `Srp6VerifierResult`, `Srp6LoginParams`

## Package format

- Dual **ESM + CJS** with bundled `.d.ts`
- Requires **Node.js >= 18**
- Zero runtime dependencies (v1 had five)
