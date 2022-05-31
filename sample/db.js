const mysql = require('mysql2');
const { generateSalt, calculateSRP6Verifier } = require('../');

const salt = generateSalt();

const username = 'test';
const password = 'test';

const authParams = {
  salt,
  identify: username,
  password,
};

const signup = (authParams) => {
  const { salt, identify, password } = authParams;
  const verifier = calculateSRP6Verifier({ salt, identify, password });
  return verifier;
};

const data = signup(authParams);

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'trinity',
  password: 'trinity',
  database: 'auth'
});

// execute will internally call prepare and query
connection.execute(
  'INSERT INTO account (username,salt,verifier,reg_mail,email,joindate)' + 'VALUES (?,?,?,?,?,NOW())',
  [username, data.salt, data.verifier, 'testEmail', 'testEmail'],
  (err, results, fields) => {
    console.log(err); // errors
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
    // If you execute same statement again, it will be picked from a LRU cache
    // which will save query preparation time and give better performance
  }
)