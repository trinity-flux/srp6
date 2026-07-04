import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  calculateSRP6Verifier,
  generateSalt,
  generateVerifier,
  SALT_LENGTH,
  VERIFIER_LENGTH,
  verifySRP6,
} from '../src';

// Known vector documented in the README since v1 (identify=test, password=test)
const KNOWN_SALT = Buffer.from(
  'bc8117514badb9af51458adb7ed91def331f0a0579641883a5a33ab9cad98344',
  'hex',
);
const KNOWN_VERIFIER = Buffer.from(
  '3e23da132e88af23978b9c4a7d007dbda1115ea34815e560805806d3a5e28f19',
  'hex',
);

// Vector whose verifier needs zero-padding (v1 emitted a corrupted 31-byte
// value here). salt = SHA256("pad-vector-154"), identify=test, password=test
const PADDED_SALT = Buffer.from(
  '02f50e2ff75726e11bd78d39ea3012127da144380b8590c48a5a5ef0b48f98d8',
  'hex',
);
const PADDED_VERIFIER = Buffer.from(
  'ade18364650451f9d6ffde33f060e9eebe4c5c4d1f2d0c2b2291ff859f67a000',
  'hex',
);

describe('generateVerifier', () => {
  it('matches the documented TrinityCore test vector', () => {
    const verifier = generateVerifier(KNOWN_SALT, 'test', 'test');
    expect(verifier.equals(KNOWN_VERIFIER)).toBe(true);
  });

  it('zero-pads verifiers to 32 bytes (v1 padding bug regression)', () => {
    const verifier = generateVerifier(PADDED_SALT, 'test', 'test');
    expect(verifier.equals(PADDED_VERIFIER)).toBe(true);
    expect(verifier[VERIFIER_LENGTH - 1]).toBe(0);
  });

  it('is case-insensitive for ASCII credentials', () => {
    const lower = generateVerifier(KNOWN_SALT, 'test', 'test');
    const upper = generateVerifier(KNOWN_SALT, 'TEST', 'TEST');
    expect(lower.equals(upper)).toBe(true);
  });

  it('does not case-fold non-ASCII characters (TrinityCore Utf8ToUpperOnlyLatin)', () => {
    const lower = generateVerifier(KNOWN_SALT, 'user', 'clave-ñoño');
    const upper = generateVerifier(KNOWN_SALT, 'user', 'CLAVE-ÑOÑO');
    expect(lower.equals(upper)).toBe(false);

    const cyrillicLower = generateVerifier(KNOWN_SALT, 'user', 'пароль');
    const cyrillicUpper = generateVerifier(KNOWN_SALT, 'user', 'ПАРОЛЬ');
    expect(cyrillicLower.equals(cyrillicUpper)).toBe(false);
  });

  it('always produces a fixed-width 32-byte verifier', () => {
    for (let i = 0; i < 200; i += 1) {
      const verifier = generateVerifier(crypto.randomBytes(SALT_LENGTH), 'test', 'test');
      expect(verifier.length).toBe(VERIFIER_LENGTH);
    }
  });

  it('produces different verifiers for different passwords', () => {
    const a = generateVerifier(KNOWN_SALT, 'test', 'password-a');
    const b = generateVerifier(KNOWN_SALT, 'test', 'password-b');
    expect(a.equals(b)).toBe(false);
  });
});

describe('calculateSRP6Verifier', () => {
  it('returns salt, verifier, credentials and joindate', () => {
    const result = calculateSRP6Verifier({
      salt: KNOWN_SALT,
      identify: 'test',
      password: 'test',
    });

    expect(result.salt).toBe(KNOWN_SALT);
    expect(result.verifier.equals(KNOWN_VERIFIER)).toBe(true);
    expect(result.identify).toBe('test');
    expect(result.password).toBe('test');
    expect(result.joindate).toBeInstanceOf(Date);
  });

  it('supports the signup/signin roundtrip', () => {
    const signup = calculateSRP6Verifier({
      salt: generateSalt(),
      identify: 'user',
      password: 'secret',
    });

    const signin = calculateSRP6Verifier({
      salt: signup.salt,
      identify: 'user',
      password: 'secret',
    });

    expect(signin.isEqual(signup.verifier)).toBe(true);
  });

  it('rejects a verifier computed with the wrong password', () => {
    const salt = generateSalt();
    const stored = calculateSRP6Verifier({ salt, identify: 'user', password: 'right' });
    const attempt = calculateSRP6Verifier({ salt, identify: 'user', password: 'wrong' });

    expect(attempt.isEqual(stored.verifier)).toBe(false);
  });

  it('isEqual handles buffers of different length without throwing', () => {
    const result = calculateSRP6Verifier({
      salt: KNOWN_SALT,
      identify: 'test',
      password: 'test',
    });
    expect(result.isEqual(Buffer.alloc(16))).toBe(false);
  });
});

describe('verifySRP6', () => {
  it('accepts matching credentials', () => {
    expect(
      verifySRP6({
        salt: KNOWN_SALT,
        verifier: KNOWN_VERIFIER,
        identify: 'test',
        password: 'test',
      }),
    ).toBe(true);
  });

  it('rejects a wrong password', () => {
    expect(
      verifySRP6({
        salt: KNOWN_SALT,
        verifier: KNOWN_VERIFIER,
        identify: 'test',
        password: 'wrong',
      }),
    ).toBe(false);
  });

  it('rejects a non-buffer stored verifier without throwing', () => {
    expect(
      verifySRP6({
        salt: KNOWN_SALT,
        verifier: 'not a buffer' as unknown as Buffer,
        identify: 'test',
        password: 'test',
      }),
    ).toBe(false);
  });
});
