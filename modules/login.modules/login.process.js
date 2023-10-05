const db = require('../../utils/dbAction.utils');
const jwt = require('jsonwebtoken');
const sql = require('./login.sql');
const encryption = require('../../utils/cryptoJS.utils');

async function viaUserCredentials(apiVersion, body) {
  let data = {};
  const { username, password } = body;
  const checkUser = await db.query(sql.checkCredentials(apiVersion), {
    username,
    password,
  });
  const status = checkUser[0]['stat'] != 'success' ? 401 : 200;
  const message = checkUser[0]['stat'] != 'success' ? 'error' : 'success';
  if (checkUser[0]['stat'] != 'success') {
    data = { 'error message': checkUser[0]['stat'] };
  } else {
    const userID = checkUser[0]['user_id'];
    const getPropertyData = await db.query(sql.getPropertyData(apiVersion), {
      userID,
    });
    data = {
      token: jwt.sign(
        {
          userData: encryption.encryptString(
            JSON.stringify(getPropertyData[0]['data']),
          ),
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: process.env.TOKEN_EXPIRES_IN,
        },
      ),
    };
  }
  return {
    status,
    data,
    message,
  };
}

module.exports = {
  viaUserCredentials,
};
