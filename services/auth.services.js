const db = require('../utils/db.utils');
const config = require('../config/dbConfig');
const jwt = require('jsonwebtoken');

async function createToken(data) {
  const { username, password } = data;
  const status = 200;
  const user = 'success';
  //   const user = await db.query(
  //     `INSERT INTO auth (
  //             username,
  //             password
  //         )
  //     VALUES (
  //         "${username}",
  //         "${password}"
  //     )`,
  //   );

  // Create token
  const token = jwt.sign({ user: user }, process.env.TOKEN_KEY, {
    expiresIn: process.env.TOKEN_EXPIRES_IN,
  });

  const message = user;

  return {
    status,
    token,
    message,
  };
}

module.exports = {
  createToken,
};
