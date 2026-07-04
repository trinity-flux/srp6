/**
 * TrinityCore (WoW Grunt protocol) SRP6 group parameters.
 * Source: TrinityCore src/common/Cryptography/Authentication/SRP6.{h,cpp}
 */

/** 256-bit prime modulus used by the WoW 3.3.5 auth protocol. */
export const N = BigInt('0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7');

/** Generator. */
export const g = 7n;

/** RFC 2945 mandates SHA-1; so does TrinityCore. */
export const HASH_ALGORITHM = 'sha1';

/** TrinityCore `SRP6::SALT_LENGTH`. */
export const SALT_LENGTH = 32;

/** TrinityCore `SRP6::VERIFIER_LENGTH`. */
export const VERIFIER_LENGTH = 32;

/** TrinityCore `MAX_ACCOUNT_STR`: longest username the client supports. */
export const MAX_ACCOUNT_LENGTH = 16;

/** TrinityCore `MAX_PASS_STR`: longest password the client supports. */
export const MAX_PASSWORD_LENGTH = 16;
