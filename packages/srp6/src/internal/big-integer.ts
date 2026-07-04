/** Modular exponentiation (square-and-multiply) for native BigInt. */
export const modPow = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
  let result = 1n;
  let b = base % modulus;
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1n;
  }
  return result;
};

/** Interprets a buffer as a little-endian unsigned integer. */
export const toBigIntLE = (buffer: Buffer): bigint =>
  BigInt(`0x${Buffer.from(buffer).reverse().toString('hex') || '0'}`);

/** Encodes an unsigned integer as a fixed-width little-endian buffer, zero-padded. */
export const toBufferLE = (value: bigint, width: number): Buffer =>
  Buffer.from(value.toString(16).padStart(width * 2, '0'), 'hex').reverse();
