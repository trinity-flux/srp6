import crypto from 'node:crypto';

import { modPow, toBigIntLE, toBufferLE } from './internal/big-integer';
import { safeEqual } from './internal/safe-equal';
import { toUpperOnlyLatin } from './internal/upper-only-latin';
import { g, HASH_ALGORITHM, N, VERIFIER_LENGTH } from './params';
import type { Srp6Credentials, Srp6LoginParams, Srp6VerifierResult } from './types';
import { assertCredentials, isSalt } from './validation';

/**
 * Computes the TrinityCore SRP6 verifier: `v = g^x % N` with
 * `x = SHA1(salt || SHA1("IDENTIFY:PASSWORD"))` interpreted little-endian.
 * Credentials are uppercased ASCII-only, like TrinityCore's
 * `Utf8ToUpperOnlyLatin`.
 *
 * @returns a fixed-width 32-byte little-endian Buffer (zero-padded).
 */
export const generateVerifier = (salt: Buffer, identify: string, password: string): Buffer => {
  isSalt(salt);
  assertCredentials(identify, password);

  const firstHash = crypto
    .createHash(HASH_ALGORITHM)
    .update(`${toUpperOnlyLatin(identify)}:${toUpperOnlyLatin(password)}`)
    .digest();

  const secondHash = crypto.createHash(HASH_ALGORITHM).update(salt).update(firstHash).digest();

  // TrinityCore treats hashes as little-endian integers and stores the
  // verifier as a fixed-width little-endian byte array.
  const x = toBigIntLE(secondHash);
  return toBufferLE(modPow(g, x, N), VERIFIER_LENGTH);
};

/**
 * Generates the verifier along with the values needed to insert a
 * TrinityCore `account` row. `isEqual` compares in constant time.
 */
export const calculateSRP6Verifier = ({
  salt,
  identify,
  password,
}: Srp6Credentials): Srp6VerifierResult => {
  const verifier = generateVerifier(salt, identify, password);

  return {
    salt,
    verifier,
    identify,
    password,
    joindate: new Date(),
    isEqual: (value: Buffer): boolean => safeEqual(value, verifier),
  };
};

/**
 * Recomputes the verifier from the stored salt and the supplied credentials,
 * and compares it against the stored verifier in constant time.
 *
 * @returns `true` when the credentials match the stored verifier.
 */
export const verifySRP6 = ({ salt, verifier, identify, password }: Srp6LoginParams): boolean =>
  safeEqual(verifier, generateVerifier(salt, identify, password));
