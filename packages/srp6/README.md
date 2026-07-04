# @trinity-flux/srp6

TrinityCore-compatible **SRP6 verifier generation** for node.js, based on the
[SRP Authentication and Key Exchange System](https://tools.ietf.org/html/rfc2945)
(RFC 2945) and [Using the Secure Remote Password (SRP) Protocol for TLS
Authentication](https://tools.ietf.org/html/rfc5054) (RFC 5054).

Zero runtime dependencies. Ships ESM + CJS with TypeScript types.

> **Note:** this library implements the **TrinityCore (WoW) variant** of SRP6
> verifier generation, which intentionally deviates from the strict RFCs. See
> [RFC compliance](#rfc-compliance) below.

## Installation

```sh
npm install @trinity-flux/srp6
# or
pnpm add @trinity-flux/srp6
```

## Usage

```ts
import { generateSalt, calculateSRP6Verifier } from '@trinity-flux/srp6';
// CJS also works: const { generateSalt, calculateSRP6Verifier } = require('@trinity-flux/srp6');

// Registration / password change: generate salt + verifier and store both
const signup = calculateSRP6Verifier({
  salt: generateSalt(),
  identify: 'test',
  password: 'test',
});
// {
//   salt: <Buffer ... 32 bytes>,
//   verifier: <Buffer ... 32 bytes>,
//   identify: 'test',
//   password: 'test',
//   joindate: 2026-07-03T00:00:00.000Z,  // Date instance
//   isEqual: [Function]                  // constant-time comparison
// }

// Login: recompute with the stored salt and compare against the stored verifier
import { verifySRP6 } from '@trinity-flux/srp6';

verifySRP6({
  salt: signup.salt,
  verifier: signup.verifier,
  identify: 'test',
  password: 'test',
}); // true (constant-time comparison)
```

### API

- `generateSalt(): Buffer` — cryptographically random 32-byte salt.
- `generateVerifier(salt: Buffer, identify: string, password: string): Buffer` —
  fixed-width 32-byte little-endian verifier.
- `calculateSRP6Verifier({ salt, identify, password })` — convenience wrapper
  returning `{ salt, verifier, identify, password, joindate, isEqual }`.
- `verifySRP6({ salt, verifier, identify, password }): boolean` — recomputes and
  compares against the stored verifier in constant time (login check).
- `isSalt(value): asserts value is Buffer` — throws `Srp6Error` when the value
  is not a Buffer (`INVALID_SALT_FORMAT`) or not 32 bytes (`INVALID_SALT_LENGTH`).
- Constants: `N`, `g`, `HASH_ALGORITHM`, `SALT_LENGTH`, `VERIFIER_LENGTH`,
  `MAX_ACCOUNT_LENGTH`, `MAX_PASSWORD_LENGTH`.

### Errors

Invalid inputs throw `Srp6Error`, which exposes a `type` field:
`INVALID_SALT_FORMAT`, `INVALID_SALT_LENGTH` (salt must be exactly 32 bytes),
`INVALID_CREDENTIALS_FORMAT` (identify/password must be non-empty strings),
`CREDENTIALS_TOO_LONG` (identify/password over 16 characters — the WoW client
and TrinityCore's `AccountMgr::CreateAccount` reject longer values).

## TrinityCore compliance

Verified against TrinityCore 3.3.5 sources
(`src/common/Cryptography/Authentication/SRP6.{h,cpp}`,
`src/server/game/Accounts/AccountMgr.{h,cpp}`, `src/common/Utilities/Util.h`):

- `N`, `g = 7`, SHA-1, `SALT_LENGTH = 32`, `VERIFIER_LENGTH = 32` match
  `SRP6::N`, `SRP6::g`, `SRP6::SALT_LENGTH`, `SRP6::VERIFIER_LENGTH`.
- Verifier math matches `SRP6::CalculateVerifier`:
  `g.ModExp(SHA1(salt, SHA1(user, ":", pass)), N).ToByteArray<32>()`
  (little-endian, zero-padded).
- Credentials are uppercased **ASCII-only**, mirroring
  `Utf8ToUpperOnlyLatin` (Trinity does *not* case-fold `ñ`, accents, or
  Cyrillic — a full-Unicode `toUpperCase()` would produce incompatible
  verifiers).
- Length limits `MAX_ACCOUNT_STR = 16` / `MAX_PASS_STR = 16` are enforced,
  matching `AccountMgr::CreateAccount`.

## Algorithm

The `account` table contains `salt` and `verifier` columns:

- `salt` is a cryptographically random 32-byte value
- `verifier` is derived from `salt`, the user's `username` (uppercased) and
  their `password` (uppercased):
  1. `h1 = SHA1("USERNAME:PASSWORD")`
  2. `h2 = SHA1(salt || h1)` (both binary)
  3. Interpret `h2` as a **little-endian** integer `x`
  4. `verifier = g^x % N`, with `g = 7` and
     `N = 0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7`
  5. Encode the result as a **32-byte little-endian** buffer (zero-padded)

## RFC compliance

This package implements only the **verifier generation** step (`x` and
`v = g^x % N`) used by TrinityCore's auth database — not the full SRP protocol
exchange (`A`/`B`, `u`, session key `K`, proofs `M1`/`M2`), which the game auth
server performs.

Deviations from the strict RFCs, required for TrinityCore compatibility:

| Aspect | RFC 2945 / 5054 | This library (TrinityCore) |
|---|---|---|
| `x = H(s \| H(I ":" P))` | SHA-1, big-endian integers | SHA-1, **little-endian** integers |
| Case handling of `I`/`P` | as provided | uppercased |
| Group parameters | ≥1024-bit groups from RFC 5054 Appendix A | 256-bit WoW modulus, `g = 7` |
| Verifier encoding | big-endian | 32-byte little-endian, zero-padded |

## v2 breaking changes

- Verifiers are now always **exactly 32 bytes, zero-padded** (v1 could emit
  shorter or corrupted verifiers for ~12% of salts due to a hex-padding bug —
  those v1 values were invalid for TrinityCore anyway).
- `joindate` is a native `Date` (was a `dayjs` instance).
- `isEqual` uses constant-time comparison.
- Dual ESM/CJS package with TypeScript types; requires Node.js >= 18.

## Resources

- [The Stanford SRP Homepage](http://srp.stanford.edu/)
- RFC 2945: [The SRP Authentication and Key Exchange System](https://tools.ietf.org/html/rfc2945)
- RFC 5054: [Using SRP for TLS Authentication](https://tools.ietf.org/html/rfc5054)
- Wikipedia: [Secure Remote Password protocol](https://en.wikipedia.org/wiki/Secure_Remote_Password_protocol)

## License

Apache-2.0
