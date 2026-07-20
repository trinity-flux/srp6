---
sidebar_position: 6
title: Migrar desde v1
---

# Migrar de v1 a v2

La v2 es una reescritura completa en TypeScript con cero dependencias de
runtime. Los nombres de la API no cambian (`generateSalt`,
`generateVerifier`, `calculateSRP6Verifier`, `isSalt`), pero hay cambios de
comportamiento incompatibles.

## Cambios incompatibles

### Los verifiers siempre tienen 32 bytes (corrección de bug)

La v1 tenía un bug de padding hexadecimal: para **~12% de los salts**
producía un verifier corto o corrupto que TrinityCore rechazaría. La v2
siempre emite exactamente 32 bytes little-endian con zero-padding.

:::info Si almacenaste verifiers de v1

Cualquier verifier de v1 con menos de 32 bytes ya era inválido para
TrinityCore — esas cuentas nunca pudieron iniciar sesión desde el cliente
del juego. Los usuarios afectados necesitan un restablecimiento de
contraseña (regenerar salt + verifier con la v2).

:::

### Mayúsculas solo ASCII (corrección de bug)

La v1 usaba el `toUpperCase()` Unicode completo de JavaScript. TrinityCore
solo convierte ASCII `a–z`. Las contraseñas con `ñ`, tildes, cirílico, etc.
ahora producen verifiers distintos — los **correctos para TrinityCore**.

### `joindate` es un `Date` nativo

La v1 devolvía una instancia de `dayjs`; la v2 devuelve un `Date` plano. Si
pasabas `joindate` a un driver SQL, nada cambia. Si llamabas métodos de
dayjs sobre él, envuélvelo tú mismo: `dayjs(result.joindate)`.

### Validación de entrada más estricta

| Entrada | v1 | v2 |
|---|---|---|
| salt | cualquier Buffer | exactamente 32 bytes (`INVALID_SALT_LENGTH`) |
| identify / password | cualquier cosa con `toUpperCase` | strings no vacíos (`INVALID_CREDENTIALS_FORMAT`) de ≤ 16 caracteres (`CREDENTIALS_TOO_LONG`) |

### Comparación de tiempo constante

`isEqual` ahora usa `crypto.timingSafeEqual` en lugar de `Buffer.compare`.
Misma firma, misma semántica, sin canal lateral de tiempo.

## Novedades en v2

- [`verifySRP6`](/api#verifysrp6) — verificación de login en una llamada
- Constantes exportadas: `N`, `g`, `HASH_ALGORITHM`, `SALT_LENGTH`,
  `VERIFIER_LENGTH`, `MAX_ACCOUNT_LENGTH`, `MAX_PASSWORD_LENGTH`
- `Srp6Error` con `type` legible por máquina y `cause` estándar
- Tipos TypeScript: `Srp6Credentials`, `Srp6VerifierResult`, `Srp6LoginParams`

## Formato del paquete

- **ESM + CJS** dual con `.d.ts` incluidos
- Requiere **Node.js >= 18**
- Cero dependencias de runtime (la v1 tenía cinco)
