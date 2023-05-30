const db = require('../../utils/dbAction.utils');
const config = require('../../config/dbConfig');
const jwt = require('jsonwebtoken');

async function createToken(body) {
  const { username, password } = body;
  const row = await db.query(
    `SELECT 
      id, 
      hotelID, 
      schemaName, 
      hostName 
    FROM auth 
    WHERE username = :username
      AND password = :password
    LIMIT 1`,
    { username, password },
  );
  const rowCount = row.length;
  const message = rowCount == 0 ? 'error' : 'success';
  const status = rowCount == 0 ? 401 : 200;
  const data =
    rowCount == 0
      ? { 'error message': 'Invalid Credentials' }
      : {
          token: jwt.sign({ userCredentials: row[0] }, process.env.TOKEN_KEY, {
            expiresIn: process.env.TOKEN_EXPIRES_IN,
          }),
        };
  return {
    status,
    data,
    message,
  };
}

module.exports = {
  createToken,
};
