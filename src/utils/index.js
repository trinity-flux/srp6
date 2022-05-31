const crypto = require('crypto');
const is = require('is_js');
const bigintBuffer = require('bigint-buffer');
const BigInteger = require('big-integer')

const { CustomError } = require('./customError');
const { ERROR_CODES, hashFormat, g, N } = require('../constants');

const isSalt = salt => {
  if(is.falsy(Buffer.isBuffer(salt))) {
    throw new CustomError(ERROR_CODES.INVALID_SALT_FORMAT);
  }
};

const generateSalt = () => Buffer.from(crypto.randomBytes(32));

const generateVerifier = (salt, identify, password) => {
  isSalt(salt);

  const firstHash = crypto.createHash(hashFormat)
    .update(`${identify.toUpperCase()}:${password.toUpperCase()}`)
    .digest();

  const secondHash = crypto.createHash(hashFormat)
    .update(salt)
    .update(firstHash)
    .digest();

  const littleEndianInteger = bigintBuffer.toBigIntLE(secondHash);
  const littleEndianIntegerPow = BigInteger(g).modPow(littleEndianInteger, N);
  const littleEndianIntegerOrder =  littleEndianIntegerPow.value.toString(16).match(/.{2}/g).reverse().join('');
  const verifier = Buffer.from(littleEndianIntegerOrder, 'hex');
  return verifier;
};

module.exports = {
  isSalt,
  generateSalt,
  generateVerifier,
};
