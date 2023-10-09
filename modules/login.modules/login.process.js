const db = require('../../utils/dbAction.utils');
const jwt = require('jsonwebtoken');
const sql = require('./login.sql');
const encryption = require('../../utils/cryptoJS.utils');

async function viaUserUUID(apiVersion, session, sessionID, authProcess) {
  const { usersID } = session.passport.user;
  // console.log(usersID, usersName, sessionID);
  const getPropertyData = await db.query(sql.getPropertyData(apiVersion), {
    usersID,
  });
  return {
    status: 200,
    data: {
      authProcess,
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
      sessionID,
      session,
    },
    message: 'success',
  };
}

// async function viaEmail(apiVersion, body) {
//   let data = {};
//   const { provider, sub, id, displayName, email } = body;
//   const checkUser = await db.query(sql.checkEmailAddress(apiVersion), {
//     email,
//   });
//   const status = checkUser[0]['stat'] != 'success' ? 401 : 200;
//   const message = checkUser[0]['stat'] != 'success' ? 'error' : 'success';
//   if (checkUser[0]['stat'] != 'success') {
//     data = { 'error message': checkUser[0]['stat'] };
//   } else {
//     const userID = checkUser[0]['user_id'];
//     const getPropertyData = await db.query(sql.getPropertyData(apiVersion), {
//       userID,
//     });
//     data = {
//       token: jwt.sign(
//         {
//           userData: encryption.encryptString(
//             JSON.stringify(getPropertyData[0]['data']),
//           ),
//         },
//         process.env.TOKEN_KEY,
//         {
//           expiresIn: process.env.TOKEN_EXPIRES_IN,
//         },
//       ),
//     };
//   }
//   return {
//     status,
//     data,
//     message,
//   };
// }

module.exports = {
  viaUserUUID,
  // viaEmail,
};
