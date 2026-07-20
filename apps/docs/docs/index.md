---
sidebar_position: 1
slug: /
title: Introduction
---

# @trinity-flux/srp6

**TrinityCore-compatible SRP6 verifier generation for node.js**, based on the
[SRP Authentication and Key Exchange System](https://tools.ietf.org/html/rfc2945)
(RFC 2945) and [Using the Secure Remote Password (SRP) Protocol for TLS
Authentication](https://tools.ietf.org/html/rfc5054) (RFC 5054).

## Features

- 🎯 **TrinityCore-exact**: verified line-by-line against TrinityCore 3.3.5
  sources (`SRP6.cpp`, `AccountMgr.cpp`, `Util.h`)
- 📦 **Zero runtime dependencies**: native `BigInt` and `node:crypto` only
- 🔒 **Constant-time comparisons** via `crypto.timingSafeEqual`
- 🧪 **Fully tested**: known test vectors, padding regression cases, and
  property tests
- 🚀 **Dual ESM/CJS** package with TypeScript type definitions

## What it does

When a player registers on a TrinityCore server, the `account` table stores a
random `salt` and a `verifier` derived from the username and password. This
library computes both values exactly like TrinityCore's
`SRP6::MakeRegistrationData`, so you can register users or verify logins from
node.js — for example from a web signup form or an account management panel.

:::warning Scope

This library implements **only the verifier generation step** (registration /
password change / credential re-check). The full SRP6 network exchange
(ephemeral keys `A`/`B`, session key, proofs `M1`/`M2`) is performed by the
TrinityCore authserver itself. See [RFC compliance](/compliance/rfc) for
details.

:::

## Quick example

```ts
import { generateSalt, calculateSRP6Verifier, verifySRP6 } from '@trinity-flux/srp6';

// Registration
const { salt, verifier } = calculateSRP6Verifier({
  salt: generateSalt(),
  identify: 'test',
  password: 'test',
});

// Login check
verifySRP6({ salt, verifier, identify: 'test', password: 'test' }); // true
```

Continue with [Getting started](/getting-started).
