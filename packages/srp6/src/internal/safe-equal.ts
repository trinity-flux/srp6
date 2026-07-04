import crypto from 'node:crypto';

/** Constant-time buffer comparison; tolerates non-buffer/mismatched-length input. */
export const safeEqual = (a: unknown, b: Buffer): boolean =>
  Buffer.isBuffer(a) && a.length === b.length && crypto.timingSafeEqual(a, b);
