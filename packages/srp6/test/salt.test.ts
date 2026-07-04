import { describe, expect, it } from 'vitest';

import { generateSalt, SALT_LENGTH } from '../src';

describe('generateSalt', () => {
  it('returns a 32-byte buffer', () => {
    const salt = generateSalt();
    expect(Buffer.isBuffer(salt)).toBe(true);
    expect(salt.length).toBe(SALT_LENGTH);
  });

  it('returns a different salt each call', () => {
    expect(generateSalt().equals(generateSalt())).toBe(false);
  });
});
