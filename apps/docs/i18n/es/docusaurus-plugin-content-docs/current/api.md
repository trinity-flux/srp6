---
sidebar_position: 3
title: Referencia de la API
---

# Referencia de la API

Todos los exports provienen de la raíz del paquete:

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

## Funciones

### `generateSalt()`

```ts
generateSalt(): Buffer
```

Devuelve un salt criptográficamente aleatorio de **32 bytes**
(`crypto.randomBytes(32)`).

### `generateVerifier()`

```ts
generateVerifier(salt: Buffer, identify: string, password: string): Buffer
```

Calcula el verifier SRP6 de TrinityCore:

- `x = SHA1(salt || SHA1("IDENTIFY:PASSWORD"))`, interpretado como entero
  little-endian
- `v = g^x % N`

Devuelve un **Buffer little-endian de ancho fijo de 32 bytes** (con
zero-padding). Las credenciales se convierten a mayúsculas solo en ASCII
antes de aplicar el hash.

**Lanza** `Srp6Error` — ver [Errores](#errores).

### `calculateSRP6Verifier()`

```ts
calculateSRP6Verifier(credentials: Srp6Credentials): Srp6VerifierResult
```

Wrapper de conveniencia para flujos de registro. Devuelve todo lo necesario
para insertar una fila en la tabla `account` de TrinityCore:

```ts
interface Srp6VerifierResult {
  salt: Buffer;        // devuelto tal cual
  verifier: Buffer;    // verifier de 32 bytes
  identify: string;    // devuelto tal cual
  password: string;    // devuelto tal cual
  joindate: Date;      // timestamp de conveniencia
  isEqual: (value: Buffer) => boolean; // comparación de tiempo constante
}
```

### `verifySRP6()`

```ts
verifySRP6(params: Srp6LoginParams): boolean
```

Verificación de login: recalcula el verifier a partir de `salt` +
credenciales y lo compara contra el `verifier` almacenado en tiempo
constante. Devuelve `false` (sin lanzar excepción) cuando el verifier
almacenado no es un Buffer o tiene una longitud incorrecta.

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

Helper de aserción: pasa cuando `value` es un Buffer de 32 bytes, lanza
`Srp6Error` en caso contrario.

## Constantes

| Constante | Valor | Equivalente en TrinityCore |
|---|---|---|
| `N` | `0x894B…9BB7` (bigint) | `SRP6::N` |
| `g` | `7n` | `SRP6::g` |
| `HASH_ALGORITHM` | `'sha1'` | SHA-1 en todo el protocolo |
| `SALT_LENGTH` | `32` | `SRP6::SALT_LENGTH` |
| `VERIFIER_LENGTH` | `32` | `SRP6::VERIFIER_LENGTH` |
| `MAX_ACCOUNT_LENGTH` | `16` | `MAX_ACCOUNT_STR` |
| `MAX_PASSWORD_LENGTH` | `16` | `MAX_PASS_STR` |

## Errores

### `Srp6Error`

Todos los fallos de validación lanzan `Srp6Error`, que extiende `Error`:

```ts
class Srp6Error extends Error {
  type: Srp6ErrorCode;                       // código legible por máquina
  additionalInfo?: Record<string, unknown>;  // contexto extra (p. ej. longitudes)
  cause?: unknown;                           // cause estándar de ES2022
}
```

### Códigos de error

| Código | Se lanza cuando |
|---|---|
| `INVALID_SALT_FORMAT` | el salt no es un Buffer |
| `INVALID_SALT_LENGTH` | el salt no tiene exactamente 32 bytes |
| `INVALID_CREDENTIALS_FORMAT` | identify/password no es un string no vacío |
| `CREDENTIALS_TOO_LONG` | identify/password supera los 16 caracteres |
| `UNKNOWN_ERROR` | fallback |

```ts
import { Srp6Error, generateVerifier } from '@trinity-flux/srp6';

try {
  generateVerifier(salt, identify, password);
} catch (error) {
  if (error instanceof Srp6Error && error.type === 'CREDENTIALS_TOO_LONG') {
    // pide al usuario una contraseña más corta
  }
}
```

## Tipos

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
