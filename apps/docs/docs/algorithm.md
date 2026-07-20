---
sidebar_position: 4
title: Algorithm
---

# Algorithm

The TrinityCore `account` table contains `salt` and `verifier` columns
(`BINARY(32)` each). The verifier is derived as follows:

## Steps

1. **Normalize credentials**: uppercase the username and password,
   **ASCII-only** (`a–z` → `A–Z`; accents, `ñ`, Cyrillic, etc. are left
   untouched — this mirrors TrinityCore's `Utf8ToUpperOnlyLatin`).

2. **First hash**:

   ```
   h1 = SHA1("USERNAME:PASSWORD")
   ```

3. **Second hash** — concatenate the raw salt bytes with `h1` and hash again:

   ```
   h2 = SHA1(salt || h1)
   ```

   Both `salt` and `h1` are **binary**, not hex strings.

4. **Interpret `h2` as a little-endian integer** `x` (the first byte is the
   least significant).

5. **Modular exponentiation**:

   ```
   v = g^x % N
   ```

   with the fixed WoW parameters:

   - `g = 7`
   - `N = 0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7`

6. **Encode** `v` as a **32-byte little-endian buffer, zero-padded**. This is
   the `verifier`.

## Reference implementation

This is exactly what `generateVerifier` does internally:

```ts
const h1 = sha1(`${upperOnlyLatin(identify)}:${upperOnlyLatin(password)}`);
const h2 = sha1(concat(salt, h1));
const x  = toBigIntLE(h2);
const v  = toBufferLE(modPow(7n, x, N), 32);
```

And the equivalent TrinityCore C++ (`SRP6::CalculateVerifier`):

```cpp
return _g.ModExp(
    SHA1::GetDigestOf(salt, SHA1::GetDigestOf(username, ":", password)),
    _N
).ToByteArray<32>();
```

## Why zero-padding matters

`v` is a number — when its most significant bytes happen to be zero (~12% of
the time), a naive hex conversion produces fewer than 32 bytes. TrinityCore
always stores exactly 32 bytes, so an unpadded verifier will never match.
This was a real bug in v1 of this library; v2 guarantees fixed-width output
and ships a regression test vector for it.

## Test vectors

| | Value (hex) |
|---|---|
| identify / password | `test` / `test` |
| salt | `bc8117514badb9af51458adb7ed91def331f0a0579641883a5a33ab9cad98344` |
| verifier | `3e23da132e88af23978b9c4a7d007dbda1115ea34815e560805806d3a5e28f19` |

Padding case (verifier ends in `00`):

| | Value (hex) |
|---|---|
| identify / password | `test` / `test` |
| salt | `02f50e2ff75726e11bd78d39ea3012127da144380b8590c48a5a5ef0b48f98d8` |
| verifier | `ade18364650451f9d6ffde33f060e9eebe4c5c4d1f2d0c2b2291ff859f67a000` |
