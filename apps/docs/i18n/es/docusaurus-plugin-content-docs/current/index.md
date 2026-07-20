---
sidebar_position: 1
slug: /
title: Introducción
---

# @trinity-flux/srp6

**Generación de verifiers SRP6 compatible con TrinityCore para node.js**,
basada en [SRP Authentication and Key Exchange System](https://tools.ietf.org/html/rfc2945)
(RFC 2945) y [Using the Secure Remote Password (SRP) Protocol for TLS
Authentication](https://tools.ietf.org/html/rfc5054) (RFC 5054).

## Características

- 🎯 **Exacto a TrinityCore**: verificado línea a línea contra las fuentes de
  TrinityCore 3.3.5 (`SRP6.cpp`, `AccountMgr.cpp`, `Util.h`)
- 📦 **Cero dependencias de runtime**: solo `BigInt` nativo y `node:crypto`
- 🔒 **Comparaciones de tiempo constante** vía `crypto.timingSafeEqual`
- 🧪 **Completamente testeado**: vectores de prueba conocidos, casos de
  regresión de padding y tests de propiedades
- 🚀 **Paquete dual ESM/CJS** con definiciones de tipos TypeScript

## Qué hace

Cuando un jugador se registra en un servidor TrinityCore, la tabla `account`
almacena un `salt` aleatorio y un `verifier` derivado del usuario y la
contraseña. Esta librería calcula ambos valores exactamente igual que
`SRP6::MakeRegistrationData` de TrinityCore, para que puedas registrar
usuarios o verificar logins desde node.js — por ejemplo desde un formulario
web de registro o un panel de gestión de cuentas.

:::warning Alcance

Esta librería implementa **únicamente la generación del verifier** (registro /
cambio de contraseña / re-verificación de credenciales). El intercambio SRP6
completo por red (claves efímeras `A`/`B`, clave de sesión, pruebas
`M1`/`M2`) lo realiza el propio authserver de TrinityCore. Consulta
[Cumplimiento RFC](/compliance/rfc) para más detalles.

:::

## Ejemplo rápido

```ts
import { generateSalt, calculateSRP6Verifier, verifySRP6 } from '@trinity-flux/srp6';

// Registro
const { salt, verifier } = calculateSRP6Verifier({
  salt: generateSalt(),
  identify: 'test',
  password: 'test',
});

// Verificación de login
verifySRP6({ salt, verifier, identify: 'test', password: 'test' }); // true
```

Continúa con [Primeros pasos](/getting-started).
