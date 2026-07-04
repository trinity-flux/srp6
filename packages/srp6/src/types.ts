export interface Srp6Credentials {
  salt: Buffer;
  identify: string;
  password: string;
}

export interface Srp6VerifierResult extends Srp6Credentials {
  verifier: Buffer;
  joindate: Date;
  isEqual: (value: Buffer) => boolean;
}

export interface Srp6LoginParams extends Srp6Credentials {
  verifier: Buffer;
}
