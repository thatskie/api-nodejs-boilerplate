const db = require('../../utils/dbAction.utils'),
  sql = require('./property.sql'),
  config = require('../../config/configuration'),
  verifyProperty = require('../../functions/verifyProperty.functions');

async function getPropertyData(apiVersion, propertyID, userData) {
  try {
    const properties = new Array(),
      errors = new Array(),
      dbEncryptKey = config.database.encryptKey;
    const { usersID } = userData;
    const validPropertyIDs = userData.properties.map((obj) => {
      const { property } = obj;
      return property.propertyID;
    });
    const requestPropertyIDs = propertyID ? [propertyID] : validPropertyIDs;
    const hasAllPropertyID = requestPropertyIDs.every((value) =>
      validPropertyIDs.includes(value),
    );
    if (hasAllPropertyID === false) {
      errors.push({
        error: { remarks: 'Request Includes an Invalid Property ID' },
      });
    } else {
      const getPropertyData = await db.query(sql.propertyData(apiVersion), {
        requestPropertyIDs,
      });
      const propertyData = await Promise.all(
        getPropertyData[0]['propertyList'].map(async (property) => {
          const { propertyID } = property.property;
          const propertyData = userData.properties.find(
            (obj) => obj.property.propertyID === propertyID,
          );
          const { configuration } = propertyData.property;
          const getUserPropertyData = await db.query(
            sql.userPropertyData(apiVersion),
            {
              usersID,
              dbEncryptKey,
            },
            configuration,
          );
          property['property']['userData'] = getUserPropertyData[0]['data'];
          return property;
        }),
      );
      properties.push(propertyData);
    }
    const status = errors.length === 0 ? 200 : 400;
    return {
      status: status,
      data:
        status == 200
          ? { properties }
          : {
              error_message: 'Unable to fetch data',
              level: 2,
              errors,
            },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function updateSelfRegistrationFeature(apiVersion, userData, content) {
  try {
    const errors = new Array();
    const { usersID, usersName } = userData;
    const validContentProperty = await verifyProperty(
      userData.properties,
      content.properties,
    );
    if (validContentProperty === false) {
      errors.push({
        error: { remarks: 'Request Includes an Invalid Property ID' },
      });
    } else {
      await Promise.all(
        content.properties.map(async (properties) => {
          const { propertyID, selfRegistration } = properties.property;
          const isActive = selfRegistration ? 1 : 0;
          await db.query(sql.updateSelfRegistration(apiVersion), {
            propertyID,
            isActive,
          });
        }),
      );
    }
    const status = errors.length == 0 ? 200 : 400;
    return {
      status: status,
      data:
        status == 200
          ? {}
          : {
              error_message: 'Unable to update data',
              level: 2,
              errors,
            },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function checkSelfRegistration(apiVersion, propertyID) {
  try {
    const property = new Array(),
      errors = new Array();
    const requestPropertyIDs = [propertyID];
    const getPropertyData = await db.query(sql.propertyData(apiVersion), {
      requestPropertyIDs,
    });
    if (getPropertyData[0]['propertyList'] === null) {
      errors.push({
        error: { remarks: 'Invalid Property ID' },
      });
    } else {
      if (getPropertyData[0]['propertyList'][0]['property']['selfRegistration'])
        property.push(getPropertyData[0]['propertyList'][0]['property']);
      else
        errors.push({
          error: {
            remarks: 'Self Registration for this property is not activated!',
          },
        });
    }
    const status = errors.length === 0 ? 200 : 400;
    return {
      status: status,
      data:
        status == 200
          ? property[0]
          : {
              error_message: 'Invalid Self Registration',
              level: 2,
              errors,
            },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  getPropertyData,
  updateSelfRegistrationFeature,
  checkSelfRegistration,
};
