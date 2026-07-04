export { ERROR_CODES, Srp6Error, type Srp6ErrorCode } from './errors';
export {
  g,
  HASH_ALGORITHM,
  MAX_ACCOUNT_LENGTH,
  MAX_PASSWORD_LENGTH,
  N,
  SALT_LENGTH,
  VERIFIER_LENGTH,
} from './params';
export { generateSalt } from './salt';
export type { Srp6Credentials, Srp6LoginParams, Srp6VerifierResult } from './types';
export { isSalt } from './validation';
export { calculateSRP6Verifier, generateVerifier, verifySRP6 } from './verifier';
