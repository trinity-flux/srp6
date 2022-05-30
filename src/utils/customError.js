const { serializeError } = require('serialize-error');
const { ERROR_CODES, ERROR_MESSAGES } = require('../constants');

class CustomError extends Error {
  constructor(type = ERROR_CODES.UNKNOWN_ERROR, originalError = {}, aditionalInfo = {}) {
    super();
    this.type = type;
    this.message = ERROR_MESSAGES[type];
    this.originalError = serializeError(originalError);
    this.aditionalInfo = aditionalInfo;
  }
}

module.exports = { CustomError };
