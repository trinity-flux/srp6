import { describe, expect, it } from 'vitest';

import { modPow, toBigIntLE, toBufferLE } from '../src/internal/big-integer';
import { safeEqual } from '../src/internal/safe-equal';
import { toUpperOnlyLatin } from '../src/internal/upper-only-latin';

describe('modPow', () => {
  it('computes modular exponentiation', () => {
    expect(modPow(4n, 13n, 497n)).toBe(445n);
    expect(modPow(7n, 0n, 11n)).toBe(1n);
    expect(modPow(2n, 10n, 1024n)).toBe(0n);
  });
});

describe('little-endian conversions', () => {
  it('roundtrips values through buffer and bigint', () => {
    const value = 0x0102030405n;
    const buffer = toBufferLE(value, 32);
    expect(buffer.length).toBe(32);
    expect(toBigIntLE(buffer)).toBe(value);
  });

  it('encodes least significant byte first', () => {
    const buffer = toBufferLE(0x01ffn, 4);
    expect([...buffer]).toEqual([0xff, 0x01, 0x00, 0x00]);
  });

  it('zero-pads odd-length hex values (v1 corruption case)', () => {
    const buffer = toBufferLE(0xabcn, 4);
    expect([...buffer]).toEqual([0xbc, 0x0a, 0x00, 0x00]);
  });

  it('handles empty buffers as zero', () => {
    expect(toBigIntLE(Buffer.alloc(0))).toBe(0n);
  });
});

describe('safeEqual', () => {
  it('matches equal buffers', () => {
    expect(safeEqual(Buffer.from('abc'), Buffer.from('abc'))).toBe(true);
  });

  it('rejects different buffers, lengths and non-buffers', () => {
    expect(safeEqual(Buffer.from('abd'), Buffer.from('abc'))).toBe(false);
    expect(safeEqual(Buffer.from('ab'), Buffer.from('abc'))).toBe(false);
    expect(safeEqual('abc', Buffer.from('abc'))).toBe(false);
  });
});

describe('toUpperOnlyLatin', () => {
  it('uppercases ASCII a-z only, like TrinityCore Utf8ToUpperOnlyLatin', () => {
    expect(toUpperOnlyLatin('test')).toBe('TEST');
    expect(toUpperOnlyLatin('TeSt123')).toBe('TEST123');
    expect(toUpperOnlyLatin('ñandú')).toBe('ñANDú');
    expect(toUpperOnlyLatin('пароль')).toBe('пароль');
    expect(toUpperOnlyLatin('straße')).toBe('STRAßE');
  });
});
