const { generateSalt, calculateSRP6Verifier } = require('../');

// generate a random salt
const salt = generateSalt();

const authParams = {
  salt,
  identify: 'test',
  password: 'test',
};

const signup = (authParams) => {
  const { salt, identify, password } = authParams;
  const verifier = calculateSRP6Verifier({ salt, identify, password });
  return verifier;
};

const signin = (authParams) => {
  const { salt, identify, password } = authParams;
  const checkVerifier = calculateSRP6Verifier({ salt, identify, password });

  const isEqual = checkVerifier.isEqual(authParams.verifier);

  return isEqual;
};

const data = signup(authParams);
const isLogged = signin(data);

console.log({
  isLogged,
  signupData: data
});
