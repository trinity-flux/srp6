import { MAX_ACCOUNT_LENGTH, SALT_LENGTH } from './params';

export const ERROR_CODES = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INVALID_SALT_FORMAT: 'INVALID_SALT_FORMAT',
  INVALID_SALT_LENGTH: 'INVALID_SALT_LENGTH',
  INVALID_CREDENTIALS_FORMAT: 'INVALID_CREDENTIALS_FORMAT',
  CREDENTIALS_TOO_LONG: 'CREDENTIALS_TOO_LONG',
} as const;

export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  UNKNOWN_ERROR: 'the error could not be identified',
  INVALID_SALT_FORMAT: 'the entered value does not correspond to a valid salt',
  INVALID_SALT_LENGTH: `the salt must be exactly ${SALT_LENGTH} bytes long`,
  INVALID_CREDENTIALS_FORMAT: 'identify and password must be non-empty strings',
  CREDENTIALS_TOO_LONG: `identify and password must be at most ${MAX_ACCOUNT_LENGTH} characters (TrinityCore MAX_ACCOUNT_STR / MAX_PASS_STR)`,
};

export type Srp6ErrorCode = keyof typeof ERROR_CODES;

export class Srp6Error extends Error {
  readonly type: Srp6ErrorCode;

  readonly additionalInfo?: Record<string, unknown>;

  constructor(
    type: Srp6ErrorCode = ERROR_CODES.UNKNOWN_ERROR,
    cause?: unknown,
    additionalInfo?: Record<string, unknown>,
  ) {
    super(ERROR_MESSAGES[type], cause === undefined ? undefined : { cause });
    this.name = 'Srp6Error';
    this.type = type;
    this.additionalInfo = additionalInfo;
  }
}
