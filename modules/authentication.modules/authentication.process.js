const db = require('../../utils/dbAction.utils');
const sendEmail = require('../../utils/nodemailer.utils').sendEmail;
const jwt = require('jsonwebtoken');
const sql = require('./authentication.sql');
const encryption = require('../../utils/cryptoJS.utils');
const crypto = require('crypto');

async function viaUserUUID(apiVersion, session, client, authType) {
  try {
    const { usersID, usersName, usersEmail } = session.passport.user;
    // console.log(usersID, usersName, sessionID);
    // authType 1 = local, 2 = google, 3 = microsoft
    const deviceID = crypto.randomUUID();
    const verificationCode = crypto
      .randomBytes(8)
      .toString('hex')
      .substring(0, 4)
      .toUpperCase();
    let verified = authType === 1 ? 0 : 1;
    const getPropertyData = await db.query(sql.getPropertyData(apiVersion), {
      usersID,
    });
    if (client.ua.toLowerCase().indexOf('postman')) {
      const browser = client.browser.name;
      const browserVersion = client.browser.version;
      const os = client.os.name;
      const osVersion =
        client.cpu.architecture !== ''
          ? client.os.version + ' [' + client.cpu.architecture + ']'
          : client.os.version;
      const IPAddress = client.IPAddress;
      const MacAddress = client.MacAddress;
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
        const dataID = checkDevice[0]['id'];
        await db.query(sql.deleteUserDevice(apiVersion), { dataID });
        verified = 1;
      } else {
        sendEmail(usersName, usersEmail, 'OTP', verificationCode);
      }
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
    return {
      status: 200,
      data: {
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
        device: {
          verified: verified == 1 ? true : false,
          verificationCode,
          deviceID,
        },
      },
      message: 'success',
    };
  } catch (err) {
    return {
      status: 599,
      data: {
        error_message: 'SQL ' + err,
      },
      message: 'error',
    };
  }
}

async function getErrorMessage(apiVersion, sessionID) {
  try {
    const getMessage = await db.query(sql.getSessionErrorMessage(apiVersion), {
      sessionID,
    });
    return {
      status: 401,
      data: {
        'error message':
          getMessage.length > 0
            ? getMessage[0]['message']
            : 'Unable to LogIn.\n' +
              'Kindly check the following:\n' +
              '1. Email should be registered to a user\n' +
              '2. Account should have a configured Property\n' +
              '3. Account should not be logged-in to another device',
      },
      message: 'error',
    };
  } catch (err) {
    return {
      status: 599,
      data: {
        error_message: 'SQL ' + err,
      },
      message: 'error',
    };
  }
}

async function verifyDevice(apiVersion, deviceID) {
  try {
    const checkDevice = await db.query(sql.checkUserDeviceByID(apiVersion), {
      deviceID,
    });
    const countRow = checkDevice.length;
    if (countRow > 0) {
      await db.query(sql.checkUserDeviceByID(apiVersion), {
        deviceID,
      });
    }
    return {
      status: countRow == 0 ? 400 : 201,
      data:
        countRow == 0
          ? { deviceID }
          : {
              'error message': 'Invalid Device ID',
            },
      message: countRow == 0 ? 'error' : 'success',
    };
  } catch (err) {
    return {
      status: 599,
      data: {
        error_message: 'SQL ' + err,
      },
      message: 'error',
    };
  }
}

async function resendOTP(session) {
  try {
    const { usersID, usersName, usersEmail } = session.passport.user;
    const verificationCode = crypto
      .randomBytes(8)
      .toString('hex')
      .substring(0, 4)
      .toUpperCase();
    sendEmail(usersName, usersEmail, 'OTP', verificationCode);
    return {
      status: 200,
      data: {
        verificationCode,
      },
      message: 'success',
    };
  } catch (err) {
    return {
      status: 599,
      data: {
        error_message: 'SQL ' + err,
      },
      message: 'error',
    };
  }
}

module.exports = {
  viaUserUUID,
  getErrorMessage,
  verifyDevice,
  resendOTP,
};
