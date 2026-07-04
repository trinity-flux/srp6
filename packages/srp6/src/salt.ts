import crypto from 'node:crypto';

import { SALT_LENGTH } from './params';

/** Generates a cryptographically random 32-byte salt. */
export const generateSalt = (): Buffer => crypto.randomBytes(SALT_LENGTH);
