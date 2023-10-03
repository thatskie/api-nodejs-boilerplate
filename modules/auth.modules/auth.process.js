const db = require('../../utils/dbAction.utils');
const config = require('../../config/dbConfig');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../../utils/nodemailer.utils');

async function createToken(body) {
  const { username, password } = body;
  const row = await db.query(
    `SELECT 
      userID, 
      name
    FROM list_users 
    WHERE username = :username
      AND cast(aes_decrypt(password, 'march27aug23') as char(50)) = :password
    LIMIT 1`,
    { username, password },
  );
  const rowCount = row.length;
  const message = rowCount == 0 ? 'error' : 'success';
  const status = rowCount == 0 ? 401 : 200;
  const emailStatus = await sendEmail(
    'jp',
    'jp@servoitsolutions.ph',
    'Sample',
    'Sample',
  );
  const data =
    rowCount == 0
      ? { 'error message': 'Invalid Credentials' }
      : {
          token: jwt.sign({ userCredentials: row[0] }, process.env.TOKEN_KEY, {
            expiresIn: process.env.TOKEN_EXPIRES_IN,
          }),
          emailStatus,
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
