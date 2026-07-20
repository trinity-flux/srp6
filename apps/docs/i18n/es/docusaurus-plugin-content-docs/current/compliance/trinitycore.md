---
sidebar_position: 2
title: TrinityCore
---

# Cumplimiento con TrinityCore

La implementación fue verificada línea a línea contra las fuentes de
**TrinityCore 3.3.5**:

- `src/common/Cryptography/Authentication/SRP6.{h,cpp}`
- `src/server/game/Accounts/AccountMgr.{h,cpp}`
- `src/common/Utilities/Util.h`

## Parámetros del grupo

TrinityCore define:

```cpp
/*static*/ std::array<uint8, 1> const SRP6::g = { 7 };
/*static*/ std::array<uint8, 32> const SRP6::N =
    HexStrToByteArray<32>("894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7", true);

static constexpr size_t SALT_LENGTH = 32;
static constexpr size_t VERIFIER_LENGTH = 32;
```

Esta librería exporta los mismos `N`, `g`, `SALT_LENGTH` y `VERIFIER_LENGTH`.

## Matemática del verifier

El `SRP6::CalculateVerifier` de TrinityCore:

```cpp
return _g.ModExp(
    SHA1::GetDigestOf(salt, SHA1::GetDigestOf(username, ":", password)),
    _N
).ToByteArray<32>();
```

`generateVerifier` lo replica exactamente: mismo orden de hashes
(`salt || h1`), interpretación de enteros little-endian y salida fija de
32 bytes little-endian (`ToByteArray<32>` aplica el mismo zero-padding).

## Normalización de credenciales (la parte sutil)

TrinityCore normaliza las credenciales en `AccountMgr::CreateAccount`:

```cpp
Utf8ToUpperOnlyLatin(username);
Utf8ToUpperOnlyLatin(password);
```

`Utf8ToUpperOnlyLatin` convierte a mayúsculas **solo ASCII `a–z`**:

```cpp
inline bool isBasicLatinCharacter(wchar_t wchar)
{
    if (wchar >= L'a' && wchar <= L'z') return true;
    if (wchar >= L'A' && wchar <= L'Z') return true;
    return false;
}
// wcharToUpperOnlyLatin: isBasicLatinCharacter(c) ? wcharToUpper(c) : c
```

:::danger El uppercase Unicode completo rompe la compatibilidad

El `toUpperCase()` de JavaScript pliega todo el rango Unicode
(`'ñ' → 'Ñ'`, `'пароль' → 'ПАРОЛЬ'`). TrinityCore **no**. Un verifier
calculado con uppercase Unicode completo no coincidirá con el de TrinityCore
para ninguna contraseña con letras no ASCII — el jugador nunca podría
iniciar sesión desde el cliente del juego. Esta librería replica el
comportamiento solo-ASCII.

:::

## Límites de cuenta

`AccountMgr::CreateAccount` rechaza credenciales demasiado largas:

```cpp
#define MAX_ACCOUNT_STR 16
#define MAX_PASS_STR 16

if (utf8length(username) > MAX_ACCOUNT_STR) return AccountOpResult::AOR_NAME_TOO_LONG;
if (utf8length(password) > MAX_PASS_STR)    return AccountOpResult::AOR_PASS_TOO_LONG;
```

Esta librería aplica los mismos límites (contando code points Unicode, como
`utf8length`) y lanza `Srp6Error` con tipo `CREDENTIALS_TOO_LONG`. Una
cuenta creada con una contraseña más larga sería inutilizable desde el
cliente de WoW de todos modos.

## Matriz de cumplimiento

| Requisito | Fuente en TrinityCore | Estado |
|---|---|---|
| `N`, `g = 7` | `SRP6::N`, `SRP6::g` | ✅ |
| SHA-1, orden de hash `salt \|\| h1` | `SRP6::CalculateVerifier` | ✅ |
| Verifier little-endian de 32 bytes con zero-padding | `ToByteArray<32>()` | ✅ |
| Salt de 32 bytes | `SRP6::SALT_LENGTH` | ✅ validado |
| Mayúsculas solo ASCII | `Utf8ToUpperOnlyLatin` | ✅ |
| Usuario/contraseña ≤ 16 caracteres | `MAX_ACCOUNT_STR` / `MAX_PASS_STR` | ✅ validado |
