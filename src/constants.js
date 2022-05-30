const N = BigInt(`0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7`);
const g = BigInt(`0x7`);
const hashFormat = 'sha1';

const ERROR_CODES = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INVALID_SALT_FORMAT: 'INVALID_SALT_FORMAT',
};

const ERROR_MESSAGES = {
  UNKNOWN_ERROR: 'the error could not be identified',
  INVALID_SALT_FORMAT: 'the entered string does not correspond to a valid salt',
};

module.exports = {
  N,
  g,
  hashFormat,
  ERROR_CODES,
  ERROR_MESSAGES,
};
