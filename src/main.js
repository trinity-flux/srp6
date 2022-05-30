const dayjs = require('dayjs');
const { generateVerifier } = require('./utils');

const calculateSRP6Verifier = ({ salt, identify, password }) => {
  const joindate = dayjs();
  const verifier = generateVerifier(salt, identify, password);
  const isEqual = value => Buffer.compare(value, verifier) === 0;

  return {
    salt,
    verifier,
    identify,
    password,
    joindate,
    isEqual,
  };
};

module.exports = { calculateSRP6Verifier };
