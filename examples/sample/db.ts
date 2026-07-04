import { calculateSRP6Verifier, generateSalt } from '@trinity-flux/srp6';
import mysql from 'mysql2';

const salt = generateSalt();

const username = 'test';
const password = 'test';

const data = calculateSRP6Verifier({ salt, identify: username, password });

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'trinity',
  password: 'trinity',
  database: 'auth',
});

// execute will internally call prepare and query
connection.execute(
  'INSERT INTO account (username,salt,verifier,reg_mail,email,joindate) VALUES (?,?,?,?,?,NOW())',
  [username, data.salt, data.verifier, 'testEmail', 'testEmail'],
  (err, results, fields) => {
    console.log(err);
    console.log(results);
    console.log(fields);
  },
);
