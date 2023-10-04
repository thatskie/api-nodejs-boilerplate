const db = require('../../utils/dbAction.utils');
// const config = require('../../config/dbConfig');
const jwt = require('jsonwebtoken');
const sql = require('./auth.sql');
const encryption = require('../../utils/cryptoJS.utils');
// const { sendEmail } = require('../../utils/nodemailer.utils');

async function createToken(apiVersion, body) {
  const { username, password } = body;
  const row = await db.query(sql.logIn(apiVersion), {
    username,
    password,
  });
  const rowCount = row.length;
  const message = rowCount == 0 ? 'error' : 'success';
  const status = rowCount == 0 ? 401 : 200;
  const encryptedData = encryption.encryptString(
    JSON.stringify(row[0]['data']),
  );
  // const emailStatus = await sendEmail(
  //   'jp',
  //   'jp@servoitsolutions.ph',
  //   'Sample',
  //   'Sample',
  // );
  const data =
    rowCount == 0
      ? { 'error message': 'Invalid Credentials' }
      : {
          token: jwt.sign(
            {
              userData: encryptedData,
            },
            process.env.TOKEN_KEY,
            {
              expiresIn: process.env.TOKEN_EXPIRES_IN,
            },
          ),
          userData: row[0]['data'],
          encryptedData,
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
