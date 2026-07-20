---
sidebar_position: 1
title: RFC 2945 / 5054
---

# RFC 2945 / 5054 compliance

This library implements the **verifier generation** step of SRP
(`x = H(s | H(I ":" P))`, `v = g^x % N` — RFC 2945 §3, RFC 5054 §2.4), as the
**TrinityCore (WoW) variant**, which intentionally deviates from the strict
RFCs.

## Scope: what is (and isn't) implemented

| Protocol element | RFC reference | Status |
|---|---|---|
| Verifier `v = g^x % N` | RFC 2945 §3 | ✅ implemented |
| Random salt | RFC 2945 §3 | ✅ `crypto.randomBytes(32)` |
| Ephemeral keys `A = g^a`, `B = kv + g^b` | RFC 5054 §2.5–2.6 | ❌ authserver's job |
| Scrambling parameter `u = H(A \| B)` | RFC 5054 §2.6 | ❌ authserver's job |
| Session key (`SHA_Interleave`, 40 bytes) | RFC 2945 §3 | ❌ authserver's job |
| Proofs `M1`, `M2` | RFC 2945 §3 | ❌ authserver's job |
| Multiplier `k` | SRP-6a: `H(N \| PAD(g))` | ❌ (WoW uses `k = 3`, plain SRP-6) |

The network exchange is performed by the TrinityCore **authserver** when the
game client connects; this library only produces (and re-checks) the values
stored in the auth database.

## Deviations from the strict RFCs

All of these are **required** for TrinityCore compatibility:

| Aspect | RFC 2945 / 5054 | This library (TrinityCore) |
|---|---|---|
| Integer encoding | big-endian (network order, RFC 5054 §2.1) | **little-endian** |
| Hash function | SHA-1 | SHA-1 ✅ |
| `x` derivation | `SHA1(s \| SHA1(I ":" P))` | same structure ✅ |
| Case handling of `I`/`P` | used as provided | uppercased (ASCII-only) |
| Group parameters | ≥1024-bit groups from RFC 5054 Appendix A (1024-bit uses `g = 2`) | 256-bit WoW modulus, `g = 7` |
| Verifier encoding | big-endian, minimal length | 32-byte little-endian, zero-padded |

## Security considerations

:::caution

The WoW 3.3.5 protocol fixes a **256-bit modulus**, which is far below the
1024-bit minimum RFC 5054 requires and is breakable with modest modern
resources. SHA-1 is likewise deprecated for new designs. These are
constraints of the legacy game client — they cannot be changed without
breaking protocol compatibility. Do not reuse these parameters for anything
other than TrinityCore interoperability.

:::

Also note that the "recompute and compare" login pattern means your node.js
service handles the plaintext password — unlike a full SRP exchange, which
never transmits it. That is inherent to how TrinityCore stores registration
data; treat the password with care (TLS, no logging).
