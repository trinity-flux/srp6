import { ERROR_CODES, Srp6Error } from './errors';
import { MAX_ACCOUNT_LENGTH, MAX_PASSWORD_LENGTH, SALT_LENGTH } from './params';

/**
 * Asserts that `salt` is a 32-byte Buffer, as required by TrinityCore.
 *
 * @throws {Srp6Error} `INVALID_SALT_FORMAT` when not a Buffer,
 *   `INVALID_SALT_LENGTH` when not exactly 32 bytes.
 */
export function isSalt(salt: unknown): asserts salt is Buffer {
  if (!Buffer.isBuffer(salt)) {
    throw new Srp6Error(ERROR_CODES.INVALID_SALT_FORMAT);
  }
  if (salt.length !== SALT_LENGTH) {
    throw new Srp6Error(ERROR_CODES.INVALID_SALT_LENGTH, undefined, { length: salt.length });
  }
}

const codePointLength = (value: string): number => [...value].length;

/**
 * Asserts that credentials are non-empty strings within the limits the WoW
 * client (and TrinityCore's `AccountMgr::CreateAccount`) accepts.
 *
 * @throws {Srp6Error} `INVALID_CREDENTIALS_FORMAT` for non-strings or empty
 *   strings, `CREDENTIALS_TOO_LONG` when a value exceeds 16 characters.
 */
export function assertCredentials(identify: unknown, password: unknown): void {
  if (typeof identify !== 'string' || typeof password !== 'string' || !identify || !password) {
    throw new Srp6Error(ERROR_CODES.INVALID_CREDENTIALS_FORMAT);
  }
  if (
    codePointLength(identify) > MAX_ACCOUNT_LENGTH ||
    codePointLength(password) > MAX_PASSWORD_LENGTH
  ) {
    throw new Srp6Error(ERROR_CODES.CREDENTIALS_TOO_LONG, undefined, {
      identifyLength: codePointLength(identify),
      passwordLength: codePointLength(password),
    });
  }
}
