---
sidebar_position: 3
title: API reference
---

# API reference

All exports come from the package root:

```ts
import {
  generateSalt,
  generateVerifier,
  calculateSRP6Verifier,
  verifySRP6,
  isSalt,
  Srp6Error,
  ERROR_CODES,
  N, g, HASH_ALGORITHM,
  SALT_LENGTH, VERIFIER_LENGTH,
  MAX_ACCOUNT_LENGTH, MAX_PASSWORD_LENGTH,
} from '@trinity-flux/srp6';
```

## Functions

### `generateSalt()`

```ts
generateSalt(): Buffer
```

Returns a cryptographically random **32-byte** salt
(`crypto.randomBytes(32)`).

### `generateVerifier()`

```ts
generateVerifier(salt: Buffer, identify: string, password: string): Buffer
```

Computes the TrinityCore SRP6 verifier:

- `x = SHA1(salt || SHA1("IDENTIFY:PASSWORD"))`, interpreted as a
  little-endian integer
- `v = g^x % N`

Returns a **fixed-width 32-byte little-endian Buffer** (zero-padded).
Credentials are uppercased ASCII-only before hashing.

**Throws** `Srp6Error` — see [Errors](#errors).

### `calculateSRP6Verifier()`

```ts
calculateSRP6Verifier(credentials: Srp6Credentials): Srp6VerifierResult
```

Convenience wrapper for registration flows. Returns everything needed to
insert a TrinityCore `account` row:

```ts
interface Srp6VerifierResult {
  salt: Buffer;        // echoed back
  verifier: Buffer;    // 32-byte verifier
  identify: string;    // echoed back
  password: string;    // echoed back
  joindate: Date;      // convenience timestamp
  isEqual: (value: Buffer) => boolean; // constant-time compare
}
```

### `verifySRP6()`

```ts
verifySRP6(params: Srp6LoginParams): boolean
```

Login check: recomputes the verifier from `salt` + credentials and compares
it against the stored `verifier` in constant time. Returns `false` (without
throwing) when the stored verifier is not a Buffer or has the wrong length.

```ts
interface Srp6LoginParams {
  salt: Buffer;
  verifier: Buffer;
  identify: string;
  password: string;
}
```

### `isSalt()`

```ts
isSalt(value: unknown): asserts value is Buffer
```

Assertion helper: passes when `value` is a 32-byte Buffer, throws `Srp6Error`
otherwise.

## Constants

| Constant | Value | Matches TrinityCore |
|---|---|---|
| `N` | `0x894B…9BB7` (bigint) | `SRP6::N` |
| `g` | `7n` | `SRP6::g` |
| `HASH_ALGORITHM` | `'sha1'` | SHA-1 everywhere |
| `SALT_LENGTH` | `32` | `SRP6::SALT_LENGTH` |
| `VERIFIER_LENGTH` | `32` | `SRP6::VERIFIER_LENGTH` |
| `MAX_ACCOUNT_LENGTH` | `16` | `MAX_ACCOUNT_STR` |
| `MAX_PASSWORD_LENGTH` | `16` | `MAX_PASS_STR` |

## Errors

### `Srp6Error`

All validation failures throw `Srp6Error`, which extends `Error`:

```ts
class Srp6Error extends Error {
  type: Srp6ErrorCode;                       // machine-readable code
  additionalInfo?: Record<string, unknown>;  // extra context (e.g. lengths)
  cause?: unknown;                           // standard ES2022 cause
}
```

### Error codes

| Code | Thrown when |
|---|---|
| `INVALID_SALT_FORMAT` | the salt is not a Buffer |
| `INVALID_SALT_LENGTH` | the salt is not exactly 32 bytes |
| `INVALID_CREDENTIALS_FORMAT` | identify/password is not a non-empty string |
| `CREDENTIALS_TOO_LONG` | identify/password exceeds 16 characters |
| `UNKNOWN_ERROR` | fallback |

```ts
import { Srp6Error, generateVerifier } from '@trinity-flux/srp6';

try {
  generateVerifier(salt, identify, password);
} catch (error) {
  if (error instanceof Srp6Error && error.type === 'CREDENTIALS_TOO_LONG') {
    // ask the user for a shorter password
  }
}
```

## Types

```ts
interface Srp6Credentials {
  salt: Buffer;
  identify: string;
  password: string;
}

interface Srp6VerifierResult extends Srp6Credentials {
  verifier: Buffer;
  joindate: Date;
  isEqual: (value: Buffer) => boolean;
}

interface Srp6LoginParams extends Srp6Credentials {
  verifier: Buffer;
}

type Srp6ErrorCode =
  | 'UNKNOWN_ERROR'
  | 'INVALID_SALT_FORMAT'
  | 'INVALID_SALT_LENGTH'
  | 'INVALID_CREDENTIALS_FORMAT'
  | 'CREDENTIALS_TOO_LONG';
```
