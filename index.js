const { calculateSRP6Verifier } = require('./src/main');
const { isSalt, generateSalt, generateVerifier } = require('./src/utils');

module.exports = {
  isSalt,
  generateSalt,
  generateVerifier,
  calculateSRP6Verifier,
};
