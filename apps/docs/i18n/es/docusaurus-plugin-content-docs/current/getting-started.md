---
sidebar_position: 2
title: Primeros pasos
---

# Primeros pasos

## Instalación

```bash
npm install @trinity-flux/srp6
# o
pnpm add @trinity-flux/srp6
```

Requiere **Node.js >= 18**. El paquete incluye builds ESM y CommonJS:

```ts
// ESM / TypeScript
import { generateSalt, calculateSRP6Verifier } from '@trinity-flux/srp6';

// CommonJS
const { generateSalt, calculateSRP6Verifier } = require('@trinity-flux/srp6');
```

## Registrar un usuario

Genera un salt aleatorio, deriva el verifier y almacena ambos en la tabla
`account`:

```ts
import { generateSalt, calculateSRP6Verifier } from '@trinity-flux/srp6';

const signup = calculateSRP6Verifier({
  salt: generateSalt(),
  identify: 'miusuario',
  password: 'micontrasena',
});

// signup.salt     -> Buffer (32 bytes) para account.salt
// signup.verifier -> Buffer (32 bytes) para account.verifier
// signup.joindate -> Date para account.joindate
```

## Verificar un login

Recalcula el verifier con el salt almacenado y compáralo contra el verifier
guardado — en tiempo constante:

```ts
import { verifySRP6 } from '@trinity-flux/srp6';

const isValid = verifySRP6({
  salt: storedSalt,          // Buffer de account.salt
  verifier: storedVerifier,  // Buffer de account.verifier
  identify: 'miusuario',
  password: 'micontrasena',
});
```

## Insertar en la base de datos auth de TrinityCore

```ts
import mysql from 'mysql2';
import { generateSalt, calculateSRP6Verifier } from '@trinity-flux/srp6';

const data = calculateSRP6Verifier({
  salt: generateSalt(),
  identify: 'miusuario',
  password: 'micontrasena',
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'trinity',
  password: 'trinity',
  database: 'auth',
});

connection.execute(
  'INSERT INTO account (username,salt,verifier,reg_mail,email,joindate) VALUES (?,?,?,?,?,NOW())',
  ['miusuario', data.salt, data.verifier, 'mail@example.com', 'mail@example.com'],
  (err, results) => {
    if (err) throw err;
    console.log(results);
  },
);
```

:::tip

Las columnas `salt` y `verifier` son `BINARY(32)` — pasa siempre los Buffers
directamente, nunca strings hexadecimales.

:::

## Reglas de entrada

- `salt` debe ser un **Buffer de 32 bytes** (usa `generateSalt()`).
- `identify` y `password` deben ser **strings no vacíos de máximo 16
  caracteres** — el cliente de WoW y `AccountMgr::CreateAccount` de
  TrinityCore rechazan valores más largos.
- Las credenciales se convierten a mayúsculas **solo en ASCII** (como
  `Utf8ToUpperOnlyLatin` de TrinityCore): `user` ≡ `USER`, pero la `ñ` y los
  caracteres cirílicos *no* se pliegan.

Una entrada inválida lanza un [`Srp6Error`](/api#srp6error).
