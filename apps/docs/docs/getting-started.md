---
sidebar_position: 2
title: Getting started
---

# Getting started

## Installation

```bash
npm install @trinity-flux/srp6
# or
pnpm add @trinity-flux/srp6
```

Requires **Node.js >= 18**. The package ships both ESM and CommonJS builds:

```ts
// ESM / TypeScript
import { generateSalt, calculateSRP6Verifier } from '@trinity-flux/srp6';

// CommonJS
const { generateSalt, calculateSRP6Verifier } = require('@trinity-flux/srp6');
```

## Registering a user

Generate a random salt, derive the verifier, and store both in the `account`
table:

```ts
import { generateSalt, calculateSRP6Verifier } from '@trinity-flux/srp6';

const signup = calculateSRP6Verifier({
  salt: generateSalt(),
  identify: 'myuser',
  password: 'mypassword',
});

// signup.salt     -> Buffer (32 bytes) for account.salt
// signup.verifier -> Buffer (32 bytes) for account.verifier
// signup.joindate -> Date for account.joindate
```

## Verifying a login

Recompute the verifier with the stored salt and compare against the stored
verifier — in constant time:

```ts
import { verifySRP6 } from '@trinity-flux/srp6';

const isValid = verifySRP6({
  salt: storedSalt,          // Buffer from account.salt
  verifier: storedVerifier,  // Buffer from account.verifier
  identify: 'myuser',
  password: 'mypassword',
});
```

## Inserting into the TrinityCore auth database

```ts
import mysql from 'mysql2';
import { generateSalt, calculateSRP6Verifier } from '@trinity-flux/srp6';

const data = calculateSRP6Verifier({
  salt: generateSalt(),
  identify: 'myuser',
  password: 'mypassword',
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'trinity',
  password: 'trinity',
  database: 'auth',
});

connection.execute(
  'INSERT INTO account (username,salt,verifier,reg_mail,email,joindate) VALUES (?,?,?,?,?,NOW())',
  ['myuser', data.salt, data.verifier, 'mail@example.com', 'mail@example.com'],
  (err, results) => {
    if (err) throw err;
    console.log(results);
  },
);
```

:::tip

The `salt` and `verifier` columns are `BINARY(32)` — always pass the Buffers
directly, never hex strings.

:::

## Input rules

- `salt` must be a **32-byte Buffer** (use `generateSalt()`).
- `identify` and `password` must be **non-empty strings of at most 16
  characters** — the WoW client and TrinityCore's `AccountMgr::CreateAccount`
  reject longer values.
- Credentials are uppercased **ASCII-only** (like TrinityCore's
  `Utf8ToUpperOnlyLatin`): `user` ≡ `USER`, but `ñ` and Cyrillic characters
  are *not* case-folded.

Invalid input throws an [`Srp6Error`](/api#srp6error).
