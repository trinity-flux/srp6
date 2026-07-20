---
sidebar_position: 1
title: RFC 2945 / 5054
---

# Cumplimiento de RFC 2945 / 5054

Esta librería implementa el paso de **generación del verifier** de SRP
(`x = H(s | H(I ":" P))`, `v = g^x % N` — RFC 2945 §3, RFC 5054 §2.4), en su
**variante TrinityCore (WoW)**, que se desvía deliberadamente de los RFC
estrictos.

## Alcance: qué está implementado (y qué no)

| Elemento del protocolo | Referencia RFC | Estado |
|---|---|---|
| Verifier `v = g^x % N` | RFC 2945 §3 | ✅ implementado |
| Salt aleatorio | RFC 2945 §3 | ✅ `crypto.randomBytes(32)` |
| Claves efímeras `A = g^a`, `B = kv + g^b` | RFC 5054 §2.5–2.6 | ❌ tarea del authserver |
| Parámetro de scrambling `u = H(A \| B)` | RFC 5054 §2.6 | ❌ tarea del authserver |
| Clave de sesión (`SHA_Interleave`, 40 bytes) | RFC 2945 §3 | ❌ tarea del authserver |
| Pruebas `M1`, `M2` | RFC 2945 §3 | ❌ tarea del authserver |
| Multiplicador `k` | SRP-6a: `H(N \| PAD(g))` | ❌ (WoW usa `k = 3`, SRP-6 plano) |

El intercambio por red lo realiza el **authserver** de TrinityCore cuando el
cliente del juego se conecta; esta librería solo produce (y re-verifica) los
valores almacenados en la base de datos auth.

## Desviaciones respecto a los RFC estrictos

Todas son **requeridas** para la compatibilidad con TrinityCore:

| Aspecto | RFC 2945 / 5054 | Esta librería (TrinityCore) |
|---|---|---|
| Codificación de enteros | big-endian (orden de red, RFC 5054 §2.1) | **little-endian** |
| Función de hash | SHA-1 | SHA-1 ✅ |
| Derivación de `x` | `SHA1(s \| SHA1(I ":" P))` | misma estructura ✅ |
| Tratamiento de mayúsculas en `I`/`P` | se usan tal cual | mayúsculas (solo ASCII) |
| Parámetros del grupo | grupos ≥1024 bits del Apéndice A de RFC 5054 (el de 1024 bits usa `g = 2`) | módulo de WoW de 256 bits, `g = 7` |
| Codificación del verifier | big-endian, longitud mínima | little-endian de 32 bytes con zero-padding |

## Consideraciones de seguridad

:::caution

El protocolo de WoW 3.3.5 fija un **módulo de 256 bits**, muy por debajo del
mínimo de 1024 bits que exige RFC 5054, y rompible con recursos modernos
modestos. SHA-1 también está obsoleto para diseños nuevos. Son restricciones
del cliente legacy del juego — no pueden cambiarse sin romper la
compatibilidad del protocolo. No reutilices estos parámetros para nada que
no sea interoperar con TrinityCore.

:::

Ten en cuenta además que el patrón de login "recalcular y comparar" implica
que tu servicio node.js maneja la contraseña en texto plano — a diferencia
del intercambio SRP completo, que nunca la transmite. Esto es inherente a
cómo TrinityCore almacena los datos de registro; trata la contraseña con
cuidado (TLS, sin logs).
