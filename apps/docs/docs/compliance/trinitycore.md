---
sidebar_position: 2
title: TrinityCore
---

# TrinityCore compliance

The implementation was verified line-by-line against **TrinityCore 3.3.5**
sources:

- `src/common/Cryptography/Authentication/SRP6.{h,cpp}`
- `src/server/game/Accounts/AccountMgr.{h,cpp}`
- `src/common/Utilities/Util.h`

## Group parameters

TrinityCore defines:

```cpp
/*static*/ std::array<uint8, 1> const SRP6::g = { 7 };
/*static*/ std::array<uint8, 32> const SRP6::N =
    HexStrToByteArray<32>("894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7", true);

static constexpr size_t SALT_LENGTH = 32;
static constexpr size_t VERIFIER_LENGTH = 32;
```

This library exports the same `N`, `g`, `SALT_LENGTH` and `VERIFIER_LENGTH`.

## Verifier math

TrinityCore's `SRP6::CalculateVerifier`:

```cpp
return _g.ModExp(
    SHA1::GetDigestOf(salt, SHA1::GetDigestOf(username, ":", password)),
    _N
).ToByteArray<32>();
```

`generateVerifier` matches this exactly: same hash order (`salt || h1`),
little-endian integer interpretation, and fixed 32-byte little-endian output
(`ToByteArray<32>` zero-pads the same way).

## Credential normalization (the subtle part)

TrinityCore normalizes credentials in `AccountMgr::CreateAccount`:

```cpp
Utf8ToUpperOnlyLatin(username);
Utf8ToUpperOnlyLatin(password);
```

`Utf8ToUpperOnlyLatin` uppercases **only ASCII `a–z`**:

```cpp
inline bool isBasicLatinCharacter(wchar_t wchar)
{
    if (wchar >= L'a' && wchar <= L'z') return true;
    if (wchar >= L'A' && wchar <= L'Z') return true;
    return false;
}
// wcharToUpperOnlyLatin: isBasicLatinCharacter(c) ? wcharToUpper(c) : c
```

:::danger Full-Unicode uppercasing breaks compatibility

JavaScript's `toUpperCase()` case-folds the entire Unicode range
(`'ñ' → 'Ñ'`, `'пароль' → 'ПАРОЛЬ'`). TrinityCore does **not**. A verifier
computed with full-Unicode uppercasing will not match TrinityCore's for any
password containing non-ASCII letters — the player could never log in from
the game client. This library replicates the ASCII-only behavior.

:::

## Account limits

`AccountMgr::CreateAccount` rejects oversized credentials:

```cpp
#define MAX_ACCOUNT_STR 16
#define MAX_PASS_STR 16

if (utf8length(username) > MAX_ACCOUNT_STR) return AccountOpResult::AOR_NAME_TOO_LONG;
if (utf8length(password) > MAX_PASS_STR)    return AccountOpResult::AOR_PASS_TOO_LONG;
```

This library enforces the same limits (counting Unicode code points, like
`utf8length`) and throws `Srp6Error` with type `CREDENTIALS_TOO_LONG`.
An account created with a longer password would be unusable from the WoW
client anyway.

## Compliance matrix

| Requirement | TrinityCore source | Status |
|---|---|---|
| `N`, `g = 7` | `SRP6::N`, `SRP6::g` | ✅ |
| SHA-1, hash order `salt \|\| h1` | `SRP6::CalculateVerifier` | ✅ |
| Little-endian, 32-byte zero-padded verifier | `ToByteArray<32>()` | ✅ |
| 32-byte salt | `SRP6::SALT_LENGTH` | ✅ enforced |
| ASCII-only uppercase | `Utf8ToUpperOnlyLatin` | ✅ |
| Username/password ≤ 16 chars | `MAX_ACCOUNT_STR` / `MAX_PASS_STR` | ✅ enforced |
