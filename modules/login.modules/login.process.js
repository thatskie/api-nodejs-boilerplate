const db = require('../../utils/dbAction.utils');
const jwt = require('jsonwebtoken');
const sql = require('./login.sql');
const encryption = require('../../utils/cryptoJS.utils');

async function viaUserCredentials(apiVersion, body) {
  const { username, password } = body;
  const row = await db.query(sql.logIn(apiVersion), {
    username,
    password,
  });
  const rowCount = row.length;
  const message = rowCount == 0 ? 'error' : 'success';
  const status = rowCount == 0 ? 401 : 200;
  const data =
    rowCount == 0
      ? { 'error message': 'Invalid Credentials' }
      : {
          token: jwt.sign(
            {
              userData: encryption.encryptString(
                JSON.stringify(row[0]['data']),
              ),
            },
            process.env.TOKEN_KEY,
            {
              expiresIn: process.env.TOKEN_EXPIRES_IN,
            },
          ),
        };
  return {
    status,
    data,
    message,
  };
}

module.exports = {
  viaUserCredentials,
};
