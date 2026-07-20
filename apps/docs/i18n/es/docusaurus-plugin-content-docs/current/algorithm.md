---
sidebar_position: 4
title: Algoritmo
---

# Algoritmo

La tabla `account` de TrinityCore contiene las columnas `salt` y `verifier`
(`BINARY(32)` cada una). El verifier se deriva así:

## Pasos

1. **Normalizar credenciales**: convertir usuario y contraseña a mayúsculas,
   **solo ASCII** (`a–z` → `A–Z`; tildes, `ñ`, cirílico, etc. quedan
   intactos — replica el `Utf8ToUpperOnlyLatin` de TrinityCore).

2. **Primer hash**:

   ```
   h1 = SHA1("USERNAME:PASSWORD")
   ```

3. **Segundo hash** — concatenar los bytes crudos del salt con `h1` y volver
   a aplicar hash:

   ```
   h2 = SHA1(salt || h1)
   ```

   Tanto `salt` como `h1` son **binarios**, no strings hexadecimales.

4. **Interpretar `h2` como entero little-endian** `x` (el primer byte es el
   menos significativo).

5. **Exponenciación modular**:

   ```
   v = g^x % N
   ```

   con los parámetros fijos de WoW:

   - `g = 7`
   - `N = 0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7`

6. **Codificar** `v` como **buffer little-endian de 32 bytes con
   zero-padding**. Este es el `verifier`.

## Implementación de referencia

Esto es exactamente lo que hace `generateVerifier` internamente:

```ts
const h1 = sha1(`${upperOnlyLatin(identify)}:${upperOnlyLatin(password)}`);
const h2 = sha1(concat(salt, h1));
const x  = toBigIntLE(h2);
const v  = toBufferLE(modPow(7n, x, N), 32);
```

Y el C++ equivalente de TrinityCore (`SRP6::CalculateVerifier`):

```cpp
return _g.ModExp(
    SHA1::GetDigestOf(salt, SHA1::GetDigestOf(username, ":", password)),
    _N
).ToByteArray<32>();
```

## Por qué importa el zero-padding

`v` es un número — cuando sus bytes más significativos resultan ser cero
(~12% de las veces), una conversión hexadecimal ingenua produce menos de
32 bytes. TrinityCore siempre almacena exactamente 32 bytes, así que un
verifier sin padding jamás coincidirá. Este fue un bug real en la v1 de esta
librería; la v2 garantiza salida de ancho fijo e incluye un vector de
regresión para este caso.

## Vectores de prueba

| | Valor (hex) |
|---|---|
| identify / password | `test` / `test` |
| salt | `bc8117514badb9af51458adb7ed91def331f0a0579641883a5a33ab9cad98344` |
| verifier | `3e23da132e88af23978b9c4a7d007dbda1115ea34815e560805806d3a5e28f19` |

Caso con padding (el verifier termina en `00`):

| | Valor (hex) |
|---|---|
| identify / password | `test` / `test` |
| salt | `02f50e2ff75726e11bd78d39ea3012127da144380b8590c48a5a5ef0b48f98d8` |
| verifier | `ade18364650451f9d6ffde33f060e9eebe4c5c4d1f2d0c2b2291ff859f67a000` |
