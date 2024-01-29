const db = require('../../utils/dbAction.utils'),
logger = require('../../utils/logger.utils'),
  jwt = require('jsonwebtoken'),
  crypto = require('crypto'),
  encryption = require('../../utils/cryptoJS.utils'),
  sendEmail = require('../../utils/nodemailer.utils').sendEmail,
  sql = require('./authentication.sql'),
  config = require('../../config/configuration');

async function viaUserUUID(apiVersion, session, client, authType, sessionID) {
  try {
    // authType 1 = local, 2 = google, 3 = microsoft
    const { usersID, usersName, usersEmail } = session.passport.user;
    const errors = new Array(),
      dbEncryptKey = config.database.encryptKey,
      verificationCode = crypto
        .randomBytes(8)
        .toString('hex')
        .substring(0, 4)
        .toUpperCase(),
      IPAddress = client.IPAddress ?? 'localhost',
      MacAddress = client.MacAddress ?? 'undefined',
      browser = client.browser.name ?? 'Postman',
      browserVersion = client.browser.version ?? 'undefined',
      os = client.os.name ?? 'undefined',
      osVersion =
        client.cpu.architecture !== ''
          ? client.os.version + ' [' + client.cpu.architecture + ']'
          : client.os.version;
    let deviceID = crypto.randomUUID(),
      verified = authType === 1 ? 0 : 1;
    const getPropertyData = await db.query(sql.getPropertyData(apiVersion), {
      sessionID,
      usersID,
      dbEncryptKey,
    });
    const checkDevice = await db.query(sql.checkUserDevice(apiVersion), {
      usersID,
      os,
      osVersion,
      browser,
      browserVersion,
      IPAddress,
      MacAddress,
    });
    if (checkDevice.length == 1) {
      if (checkDevice[0]['verified'] === 1 && checkDevice[0]['expired'] === 0) {
        verified = 1;
      } else {
        verified = 0;
        deviceID = checkDevice[0]['id'];
      }
    } else {
      await db.query(sql.insertIntoUserDevices(apiVersion), {
        deviceID,
        usersID,
        os,
        osVersion,
        browser,
        browserVersion,
        IPAddress,
        MacAddress,
        verified,
      });
    }
    if (verified === 0) {
      // sendEmail(usersName, usersEmail, 'OTP', verificationCode);
      emailName = 'VerifyDevice';
      const getEmailBodyVerifyDevice = await db.query(
        sql.getEmailContent(apiVersion),
        {
          emailName,
        },
      );
      const emailSubjectVerifyDevice = getEmailBodyVerifyDevice[0]['subject'],
        emailBodyVerifyDevice = getEmailBodyVerifyDevice[0]['content']
          .replaceAll('@guestName', usersName)
          .replaceAll('@otp', verificationCode);
      const emailInfo = await sendEmail(
        usersName ?? getPropertyData[0]['data']['usersName'],
        usersEmail ?? getPropertyData[0]['data']['usersEmail'],
        emailSubjectVerifyDevice,
        emailBodyVerifyDevice,
      ).catch((error) => {
        if (error) console.log(error);
      });
    }
    await db.query(sql.markAllDeviceAsInactive(apiVersion), { usersID });
    await db.query(sql.updateActiveDevice(apiVersion), {
      usersID,
      os,
      osVersion,
      browser,
      browserVersion,
      IPAddress,
      MacAddress,
    });
    return {
      status: 200,
      data: {
        token: jwt.sign(
          {
            userData: encryption.encryptString(
              JSON.stringify(getPropertyData[0]['data']),
            ),
            sessionID,
          },
          config.passport.jwt.secret,
          config.passport.jwt.options,
        ),
        user: {
          name: usersName ?? getPropertyData[0]['data']['usersName'],
          email: usersEmail ?? getPropertyData[0]['data']['usersEmail'],
          id: usersID ?? getPropertyData[0]['data']['usersID'],
          roleLevel: getPropertyData[0]['data']['usersRoleLevel'] ?? 6,
        },
        device: {
          verified: verified == 1 ? true : false,
          verificationCode,
          deviceID,
        },
        sessionID,
      },
      message: 'success',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function viaSessionID(apiVersion, sessionID) {
  try {
    const dbEncryptKey = config.database.encryptKey,
      usersID = null;
    const getPropertyData = await db.query(sql.getPropertyData(apiVersion), {
      sessionID,
      usersID,
      dbEncryptKey,
    });
    return {
      status: 200,
      data: {
        token: jwt.sign(
          {
            userData: encryption.encryptString(
              JSON.stringify(getPropertyData[0]['data']),
            ),
            sessionID,
          },
          config.passport.jwt.secret,
          config.passport.jwt.options,
        ),
        user: {
          name: getPropertyData[0]['data']['usersName'],
          email: getPropertyData[0]['data']['usersEmail'],
          id: getPropertyData[0]['data']['usersID'],
          roleLevel: getPropertyData[0]['data']['usersRoleLevel'] ?? 6,
        },
        sessionID,
      },
      message: 'success',
    };
  } catch (err) {
    throw new Error(err);
  }
}

// async function getErrorMessage(apiVersion) {
//   try {
//     const errors = new Array();
//     let deleteSession = false;
//     const getMessage = await db.query(sql.getLogInErrorMessage(apiVersion), {});
//     const errorMess =
//       'Unable to LogIn.\nKindly check the following:\n1. Email should be registered to a user\n2. Account should have a configured Property\n3. Account should not be logged-in to another device';
//     if (getMessage.length > 0) {
//       if (getMessage[0]['errorMessage']) {
//         errors.push({ error: { remarks: getMessage[0]['errorMessage'] } });
//         if (
//           getMessage[0]['errorMessage'] ==
//           'Account is already logged-in on another device'
//         )
//           deleteSession = true;
//       }
//     } else {
//       errors.push({ error: { remarks: errorMess } });
//     }
//     return {
//       status: 401,
//       data: {
//         error_message: 'Unable to login',
//         level: 2,
//         errors,
//         deleteSession,
//       },
//       message: 'error',
//     };
//   } catch (err) {
//     throw new Error(err);
//   }
// }

async function verifyDevice(apiVersion, deviceID) {
  try {
    const errors = new Array();
    const checkDevice = await db.query(sql.checkUserDeviceByID(apiVersion), {
      deviceID,
    });
    const countRow = checkDevice.length;
    if (countRow > 0)
      await db.query(sql.verifyDevice(apiVersion), {
        deviceID,
      });
    return {
      status: countRow == 0 ? 400 : 201,
      data:
        countRow > 0
          ? { deviceID }
          : {
              error_message: 'Invalid Device ID',
              level: 2,
              errors,
            },
      message: countRow == 0 ? 'error' : 'success',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function resendOTP(apiVersion, user) {
  try {
    const errors = new Array(),
      verificationCode = crypto
        .randomBytes(8)
        .toString('hex')
        .substring(0, 4)
        .toUpperCase();
    const { usersID, usersName, usersEmail } = user.userData;
    emailName = 'VerifyDevice';
    const getEmailBodyVerifyDevice = await db.query(
      sql.getEmailContent(apiVersion),
      {
        emailName,
      },
    );
    const emailSubjectVerifyDevice = getEmailBodyVerifyDevice[0]['subject'],
      emailBodyVerifyDevice = getEmailBodyVerifyDevice[0]['content']
        .replaceAll('@guestName', usersName)
        .replaceAll('@otp', verificationCode);
    const emailInfo = await sendEmail(
      usersName ?? getPropertyData[0]['data']['usersName'],
      usersEmail ?? getPropertyData[0]['data']['usersEmail'],
      emailSubjectVerifyDevice,
      emailBodyVerifyDevice,
    ).catch((error) => {
      if (error) console.log(error);
    });
    return {
      status: 200,
      data: {
        verificationCode,
      },
      message: 'success',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function logout(apiVersion, userID) {
  try {
    // await db.query(sql.deleteLoginError(apiVersion), {});
    await db.query(sql.deleteSession(apiVersion), {
      userID,
    });
    return {
      status: 200,
      data: {},
      message: 'success',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function getUsersDevice(apiVersion, usersID) {
  try {
    const getUsersDevice = await db.query(sql.getUsersDevice(apiVersion), {
      usersID,
    });
    const countRow = getUsersDevice.length;
    return {
      status: countRow == 0 ? 400 : 201,
      data: getUsersDevice[0],
      message: countRow == 0 ? 'error' : 'success',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function addOTPToSession(apiVersion, usersID) {
  try {
    const verificationCode = crypto
        .randomBytes(8)
        .toString('hex')
        .substring(0, 4)
        .toUpperCase(),
      errors = new Array(),
      checkUser = await db.query(sql.getUsersSession(apiVersion), {
        usersID,
      }),
      countRow = checkUser.length,
      sessionID = checkUser[0]['session_id'] ?? null;
    if (countRow > 0) {
      await db.query(sql.updateSessionOTP(apiVersion), {
        sessionID,
        verificationCode,
      });
      const emailName = 'DeleteSession',
        usersName = checkUser[0]['usersName'],
        usersEmail = checkUser[0]['usersEmail'],
        getEmailBodyVerifyDevice = await db.query(
          sql.getEmailContent(apiVersion),
          {
            emailName,
          },
        ),
        emailSubjectVerifyDevice = getEmailBodyVerifyDevice[0]['subject'],
        emailBodyVerifyDevice = getEmailBodyVerifyDevice[0]['content']
          .replaceAll('@guestName', usersName)
          .replaceAll('@otp', verificationCode);
      const emailInfo = await sendEmail(
        usersName,
        usersEmail,
        emailSubjectVerifyDevice,
        emailBodyVerifyDevice,
      ).catch((error) => {
        if (error) console.log(error);
      });
    } else {
      errors.push({
        error: {
          remarks: 'Invalid User ID',
        },
      });
    }
    const status = errors.length === 0 ? 201 : 400;
    return {
      status,
      data:
        status == 201
          ? { verificationCode, sessionID }
          : { error_message: 'Unable to renew user session', level: 2, errors },
      message: status == 201 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function renewSession(apiVersion, content) {
  try {
    const { verificationCode, sessionID } = content,
      errors = new Array(),
      checkSession = await db.query(sql.getSessionUserData(apiVersion), {
        sessionID,
      }),
      countRow = checkSession.length;
    let sessionData = null;
    if (countRow == 0)
      errors.push({
        error: {
          remarks: 'Session ID not found!',
        },
      });
    else {
      const { data, otp } = checkSession[0];
      sessionData = { user: data };
      if (otp !== verificationCode)
        errors.push({
          error: {
            remarks: 'Invalid verification code!',
          },
        });
      else
        await db.query(sql.deleteSessionBySessionID(apiVersion), {
          sessionID,
        });
    }
    const status = errors.length === 0 ? 200 : 400;
    return {
      status,
      data:
        status == 200
          ? {
              message: 'Successfully renewed user session',
              sessionData,
            }
          : { error_message: 'Unable to renew user session', level: 2, errors },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  viaUserUUID,
  // getErrorMessage,
  verifyDevice,
  resendOTP,
  logout,
  viaSessionID,
  getUsersDevice,
  addOTPToSession,
  renewSession,
};
