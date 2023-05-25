const db = require('../utils/db.utils');
const config = require('../config/dbConfig');
const jwt = require('jsonwebtoken');

async function createToken(body) {
  const { username, password } = body;
  const row = await db.query(
    `SELECT 
        id, hotelid
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
          hotelID: row[0]['hotelid'],
          token: jwt.sign({ user: row }, process.env.TOKEN_KEY, {
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
