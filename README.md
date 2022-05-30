# TrinitySRP6

Implementation of the [SRP Authentication and Key Exchange
System](http://tools.ietf.org/html/rfc2945) and protocols in [Secure
Remote Password (SRP) Protocol for TLS
Authentication](http://tools.ietf.org/html/rfc5054)

This module provides the client implementations of trinity SRP-6a for node.js.

# **Proper interfacing with SRP6**

The `account` table contains `salt` and `verifier` columns containing the respective SRP6 values.

- `salt` is a cryptographically random 32-byte value
- `verifier` is derived from `salt`, as well as the user's `username` (all uppercase) and their `password` (all uppercase)

If you are registering a user, or changing a user's password, generate a random `salt`, then calculate the appropriate `verifier`, and store both in the database.If you are logging a user in, re-calculate the `verifier` using the stored `salt` and their login details, and compare it against the stored `verifier`. If the values match, the login details are correct.

To obtain the `verifier`:

- Calculate `h1 = SHA1("USERNAME:PASSWORD")`, substituting the user's username and password converted to uppercase
    - This is the old `sha_pass_hash` value!
- Calculate `h2 = SHA1(salt || h1)`, where `||` is concatenation (the `.` operator in PHP)
    - Note that both `salt` and `h1` are **binary**, not hexadecimal strings!
- Treat `h2` as an integer in little-endian order (the first byte is the least significant)
- Calculate `(g ^ h2) % N`
    - `^` is modular exponentiation, `%` is the modulo operator
    - `g` and `N` are parameters, which are fixed in the WoW implementation:
        - `g = 7`
        - `N = 0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7`
- Convert the result back to a byte array in little-endian order
- This is your `verifier` - you're done!

# Content

* [Installation](#installation)
* [Usage](#how-to-use-it)
* [Resources](#resources)

## Installation

`npm install trinity-srp6`

or `git clone` this archive and run `npm install` in it.

## How to use it

```js
const { generateSalt, calculateSRP6Verifier } = require('trinity-srp6');

const authParams = {
  salt: generateSalt(),
  identify: 'test',
  password: 'test',
};

/*
 The result of this is an object with the following.
 {
   salt: <Buffer bc 81 17 51 4b ad b9 af 51 45 8a db 7e d9 1d ef 33 1f 0a 05 79 64 18 83 a5 a3 3a b9 ca d9 83 44>,
    verifier: <Buffer 3e 23 da 13 2e 88 af 23 97 8b 9c 4a 7d 00 7d bd a1 11 5e a3 48 15 e5 60 80 58 06 d3 a5 e2 8f 19>,
    identify: 'test',
    password: 'test',
    joindate: M {
      '$L': 'en',
      '$d': 2022-05-30T23:06:57.206Z,
      '$x': {},
      '$y': 2022,
      '$M': 4,
      '$D': 30,
      '$W': 1,
      '$H': 18,
      '$m': 6,
      '$s': 57,
      '$ms': 206
    },
    isEqual: [Function: isEqual]
 }
*/
const signup = (authParams) => {
  const { salt, identify, password } = authParams;
  return calculateSRP6Verifier({ salt, identify, password });
};

// The result of this is true or false depending on whether or not it meets the check passed by parameters.
const signin = (authParams) => {
  const { salt, identify, password } = authParams;
  const checkVerifier = calculateSRP6Verifier({ salt, identify, password });

  return checkVerifier.isEqual(authParams.verifier);
};
```
## Resources

- [The Stanford SRP Homepage](http://srp.stanford.edu/)
- RFC 2945: [The SRP Authentication and Key Exchange System](http://tools.ietf.org/html/rfc2945)
- RFC 5054: [Using the Secure Remote Password (SRP) Protocol for TLS Authentication](http://tools.ietf.org/html/rfc5054)
- Wikipedia: [The Secure Remote Password protocol](http://en.wikipedia.org/wiki/Secure_Remote_Password_protocol)

## License

MIT