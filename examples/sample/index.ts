import {
  calculateSRP6Verifier,
  generateSalt,
  type Srp6Credentials,
  type Srp6VerifierResult,
  verifySRP6,
} from '@trinity-flux/srp6';

// generate a random salt
const salt = generateSalt();

const authParams: Srp6Credentials = {
  salt,
  identify: 'test',
  password: 'test',
};

const signup = ({ salt, identify, password }: Srp6Credentials): Srp6VerifierResult =>
  calculateSRP6Verifier({ salt, identify, password });

const signin = ({ salt, identify, password, verifier }: Srp6VerifierResult): boolean =>
  verifySRP6({ salt, identify, password, verifier });

const data = signup(authParams);
const isLogged = signin(data);

console.log({
  isLogged,
  signupData: data,
});
