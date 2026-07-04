import { describe, expect, it } from 'vitest';

import { generateSalt, generateVerifier, isSalt, SALT_LENGTH, Srp6Error } from '../src';

const errorType = (fn: () => unknown): string | undefined => {
  try {
    fn();
    return undefined;
  } catch (error) {
    return (error as Srp6Error).type;
  }
};

describe('isSalt', () => {
  it('accepts a 32-byte buffer', () => {
    expect(() => isSalt(Buffer.alloc(SALT_LENGTH))).not.toThrow();
  });

  it.each(['deadbeef', 42, null, undefined, {}, [1, 2, 3]])('throws Srp6Error for %p', (value) => {
    expect(() => isSalt(value)).toThrow(Srp6Error);
  });

  it('throws with INVALID_SALT_FORMAT type for non-buffers', () => {
    expect(errorType(() => isSalt('not a buffer'))).toBe('INVALID_SALT_FORMAT');
  });

  it('throws with INVALID_SALT_LENGTH type for wrong-sized buffers', () => {
    expect(errorType(() => isSalt(Buffer.alloc(16)))).toBe('INVALID_SALT_LENGTH');
  });
});

describe('credential validation', () => {
  const salt = generateSalt();

  it.each([
    ['', 'password'],
    ['identify', ''],
    [undefined as unknown as string, 'password'],
    ['identify', 42 as unknown as string],
  ])('throws INVALID_CREDENTIALS_FORMAT for identify=%p password=%p', (identify, password) => {
    expect(errorType(() => generateVerifier(salt, identify, password))).toBe(
      'INVALID_CREDENTIALS_FORMAT',
    );
  });

  it('throws CREDENTIALS_TOO_LONG beyond the 16-char client limit', () => {
    expect(errorType(() => generateVerifier(salt, 'a'.repeat(17), 'password'))).toBe(
      'CREDENTIALS_TOO_LONG',
    );
    expect(errorType(() => generateVerifier(salt, 'identify', 'b'.repeat(17)))).toBe(
      'CREDENTIALS_TOO_LONG',
    );
  });

  it('accepts credentials at exactly the 16-char limit', () => {
    expect(() => generateVerifier(salt, 'a'.repeat(16), 'b'.repeat(16))).not.toThrow();
  });
});
