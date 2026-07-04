# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0](https://github.com/trinity-flux/srp6/compare/v1.0.1...v2.0.0) (2026-07-03)

### ⚠ BREAKING CHANGES

* rewritten in TypeScript; dual ESM/CJS output with type definitions; requires Node.js >= 18
* verifiers are now always exactly 32 bytes, zero-padded little-endian (v1 produced short/corrupted verifiers for ~12% of salts due to a hex-padding bug)
* `joindate` is a native `Date` instead of a `dayjs` instance
* `isEqual` uses constant-time comparison (`crypto.timingSafeEqual`)
* zero runtime dependencies (dropped `big-integer`, `bigint-buffer`, `dayjs`, `is_js`, `serialize-error`)
* repository restructured as a Turborepo monorepo; the package now lives in `packages/srp6`

### Features

* new `verifySRP6({ salt, verifier, identify, password })` helper for constant-time login checks
* input validation: salt must be a 32-byte Buffer (`INVALID_SALT_LENGTH`), identify/password must be non-empty strings (`INVALID_CREDENTIALS_FORMAT`) of at most 16 characters (`CREDENTIALS_TOO_LONG`, matching TrinityCore `MAX_ACCOUNT_STR`/`MAX_PASS_STR`)
* credentials are uppercased ASCII-only, mirroring TrinityCore `Utf8ToUpperOnlyLatin` (full-Unicode `toUpperCase()` produced verifiers incompatible with TrinityCore for non-ASCII passwords)
* `Srp6Error` now uses the standard `cause` option
* exported constants `MAX_ACCOUNT_LENGTH` and `MAX_PASSWORD_LENGTH`


### [1.0.1](https://github.com/trinity-flux/srp6/compare/v1.0.0...v1.0.1) (2022-05-31)


### Bug Fixes

* example record is added to the account table and now the salt generation works ([103e4fb](https://github.com/trinity-flux/srp6/commit/103e4fb89de6a6c1d1058411950ddc8c713f0377))

## 1.0.0 (2022-05-30)
