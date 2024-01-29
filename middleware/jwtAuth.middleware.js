const jwt = require('jsonwebtoken'),
  config = require('../config/configuration'),
  encryption = require('../utils/cryptoJS.utils'),
  db = require('../utils/dbAction.utils'),
  sql = require('../modules/authentication.modules/authentication.sql');

const verifyToken = async (req, res, next) => {
  const errors = new Array();
  if (!req.params.selfRegistration) {
    const token = req.headers['x-access-token'];
    if (!token) {
      errors.push('A token is required for authentication');
      return res.status(403).send({
        status: 403,
        data: {
          error_message: 'Invalid Token',
          level: 1,
          errors,
        },
        message: 'error',
      });
    }
    try {
      const decoded = jwt.verify(
        token,
        config.passport.jwt.secret,
        config.passport.jwt.options,
      );
      const userData = JSON.parse(encryption.decryptString(decoded.userData));
      decoded.userData = userData;
      const userDataDecoded = decoded.userData;
      const sessionID = decoded.sessionID;
      // console.log(sessionID);
      const checkSessionData = await db.query(
        sql.getSessionUserData('v1.0.0'),
        {
          sessionID,
        },
      );
      if (checkSessionData.length === 0) errors.push('Invalid Token Session');
      else if (checkSessionData[0]['data']['usersID'] !== userData.usersID)
        errors.push('Invalid User Data');
      if (errors.length > 0)
        return res.status(403).send({
          status: 403,
          data: {
            error_message: 'Invalid Token',
            level: 1,
            errors,
          },
          message: 'error',
        });
      else {
        const modifiedProperty = userDataDecoded.properties.map((item) =>
          item.property.configuration
            ? {
                ...item,
                property: {
                  ...item.property,
                  configuration: encryption.encryptString(
                    JSON.stringify(item.property.configuration),
                  ),
                },
              }
            : item,
        );
        const data = {
          userData: {
            usersID: userData.usersID,
            usersName: userData.usersName,
            usersEmail: userData.usersEmail,
            properties: modifiedProperty,
          },
        };
        req.user = data;
      }
    } catch (err) {
      errors.push(err);
      return res.status(403).send({
        status: 403,
        data: {
          error_message: 'Invalid token',
          level: 1,
          errors,
        },
        message: 'error',
      });
    }
  } else {
    req.user = {
      userData: {
        usersID: null,
        usersName: null,
        usersEmail: null,
        properties: [
          {
            property: {
              propertyID: 12121,
              propertyName: 'sample',
              configuration: 'invalid',
            },
          },
        ],
      },
    };
  }
  return next();
};

module.exports = verifyToken;
