const crypto = require('crypto'),
  db = require('../../utils/dbAction.utils'),
  logger = require('../../utils/logger.utils'),
  sql = require('./roles.sql'),
  verifyProperty = require('../../functions/verifyProperty.functions'),
  config = require('../../config/configuration');

async function createUserRoles(apiVersion, userData, content) {
  try {
    const errors = new Array(),
      dbEncryptKey = config.database.encryptKey;
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
          const { propertyID, roles } = properties.property;
          const propertyData = userData.properties.find(
            (obj) => obj.property.propertyID === propertyID,
          );
          const { configuration, propertyName } = propertyData.property;
          const getUserRoleLevel = await db.query(
            sql.getUserRoleLevel(apiVersion),
            {
              usersID,
              dbEncryptKey,
            },
            configuration,
          );
          const userRoleLevel =
            getUserRoleLevel.length == 0
              ? 100
              : getUserRoleLevel[0]['roleLevel'];
          roles.map(async (roles) => {
            const { description, level, privileges } = roles.role;
            if (userRoleLevel == 100)
              errors.push({
                error: {
                  propertyName,
                  remarks:
                    'Cannot proceed, you do not have a user role for this property.',
                  data: roles.role,
                },
              });
            else if (userRoleLevel >= level)
              errors.push({
                error: {
                  propertyName,
                  remarks:
                    'Cannot create user role with same/higher level as the user',
                  data: roles.role,
                },
              });
            else {
              const roleID = crypto.randomUUID();
              await db.query(
                sql.insertToUserRoles(apiVersion),
                {
                  description,
                  level,
                  dbEncryptKey,
                  roleID,
                },
                configuration,
              );
              if (privileges) {
                const jsonData = new Array();
                privileges.map((privileges) => {
                  const { privID, moduleID, privCode, moduleCode } =
                    privileges.privilege;
                  if (privID) jsonData.push({ privID, moduleID });
                  else jsonData.push({ privCode, moduleCode });
                });
                await db.query(
                  sql.updatePrivOfUserRole(apiVersion),
                  {
                    roleID,
                    usersID,
                    jsonData,
                  },
                  configuration,
                );
              }
            }
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
          : { error_message: 'Unable to create User Roles', level: 2, errors },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function updateUserRole(apiVersion, userData, content) {
  try {
    const { usersID, usersName } = userData;
    const errors = new Array(),
      dbEncryptKey = config.database.encryptKey;
    const validContentProperty = await verifyProperty(
      userData.properties,
      content.properties,
    );
    if (validContentProperty === false) {
      errors.push({
        error: {
          remarks: 'Request Includes an Invalid Property ID',
        },
      });
    } else {
      await Promise.all(
        content.properties.map(async (properties) => {
          const { propertyID, roles } = properties.property;
          const propertyData = userData.properties.find(
            (obj) => obj.property.propertyID === propertyID,
          );
          const { configuration, propertyName } = propertyData.property;
          const getUserRoleLevel = await db.query(
            sql.getUserRoleLevel(apiVersion),
            {
              usersID,
              dbEncryptKey,
            },
            configuration,
          );
          const userRoleLevel =
            getUserRoleLevel.length == 0
              ? 100
              : getUserRoleLevel[0]['roleLevel'];
          await Promise.all(
            roles.map(async (roles) => {
              let errorRemarks = '';
              const { roleID, description, level, isActive, privileges } =
                roles.role;
              const getRoleLevel = await db.query(
                sql.getRoleLevel(apiVersion),
                {
                  roleID,
                  dbEncryptKey,
                },
                configuration,
              );
              const roleLevel =
                getRoleLevel.length == 0 ? 100 : getRoleLevel[0]['roleLevel'];
              if (userRoleLevel == 100)
                errorRemarks =
                  'Cannot proceed, you do not have a user role for this property';
              else if (roleLevel == 100) errorRemarks = 'Role ID Not found';
              else if (userRoleLevel >= roleLevel)
                errorRemarks =
                  'Cannot update role to have same/higher level as the user';
              else if (userRoleLevel >= level)
                errorRemarks = 'Cannot update role with the same/higher Level';
              else {
                const updatedLevel = level ?? null,
                  updatedIsActive = isActive === undefined ?? null,
                  updatedDescription = description ?? null;
                await db.query(
                  sql.updateUserRoles(apiVersion),
                  {
                    roleID,
                    updatedLevel,
                    updatedIsActive,
                    updatedDescription,
                    dbEncryptKey,
                  },
                  configuration,
                );
                if (privileges) {
                  const jsonData = new Array();
                  privileges.map((privileges) => {
                    const { privID, moduleID } = privileges.privilege;
                    jsonData.push({ privID, moduleID });
                  });
                  await db.query(
                    sql.updatePrivOfUserRole(apiVersion),
                    {
                      roleID,
                      usersID,
                      jsonData,
                    },
                    configuration,
                  );
                }
              }
              if (errorRemarks !== '')
                errors.push({
                  error: {
                    propertyName,
                    remarks: errorRemarks,
                    data: roles.role,
                  },
                });
            }),
          );
        }),
      );
    }
    const status = errors.length == 0 ? 200 : 400;
    return {
      status: status,
      data:
        status == 200
          ? {}
          : { error_message: 'Unable to update User Roles', level: 2, errors },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function getUserRoles(apiVersion, userData, propertyID, specificRoleID) {
  try {
    const { usersID, usersName } = userData;
    const errors = new Array(),
      roles = new Array(),
      dbEncryptKey = config.database.encryptKey;
    const validPropertyIDs = propertyID
      ? [{ property: { propertyID } }]
      : userData.properties.map((obj) => {
          const { property } = obj;
          return { property: { propertyID: property.propertyID } };
        });
    const validContentProperty = await verifyProperty(
      userData.properties,
      validPropertyIDs,
    );
    if (validContentProperty === false) {
      errors.push({
        error: {
          remarks: 'Request Includes an Invalid Property ID',
        },
      });
    } else {
      await Promise.all(
        validPropertyIDs.map(async (property) => {
          const { propertyID } = property.property;
          const propertyData = userData.properties.find(
            (obj) => obj.property.propertyID === propertyID,
          );
          const { propertyName, configuration } = propertyData.property;
          const getRoleData = await db.query(
            sql.getRoles(apiVersion),
            { dbEncryptKey },
            configuration,
          );
          getRoleData.map(async (role) => {
            const {
              roleID,
              description,
              isActive,
              level,
              modules,
              privileges,
            } = role;
            if (!specificRoleID)
              roles.push({
                role: {
                  propertyID,
                  propertyName,
                  roleID,
                  description,
                  modules,
                  privileges,
                  isActive: isActive == 1 ? true : false,
                  level,
                },
              });
            else if (specificRoleID === roleID)
              roles.push({
                role: {
                  propertyID,
                  propertyName,
                  roleID,
                  description,
                  modules,
                  privileges,
                  isActive: isActive == 1 ? true : false,
                  level,
                },
              });
          });
        }),
      );
    }
    if (roles.length == 0 && errors.length == 0)
      errors.push({
        error: {
          remarks: 'Invalid User Role ID',
        },
      });
    const status = errors.length == 0 ? 200 : 400;
    return {
      status: status,
      data:
        status == 200
          ? { roles }
          : { error_message: 'Unable to fetch User Roles', level: 2, errors },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    throw new Error(err);
  }
}

/*
async function updateUserRolePrivileges(apiVersion, userData, content) {
  try {
    const { usersID, usersName } = userData;
    const dbEncryptKey = config.database.encryptKey;
    const errorData = new Array();
    const validContentProperty = await verifyProperty(
      userData.properties,
      content.properties,
    );
    if (validContentProperty === false) {
      errorRemarks = 'Request Includes an Invalid Property ID';
    } else {
      await Promise.all(
        content.properties.map(async (properties) => {
          const { propertyID, roles } = properties.property;
          const propertyData = userData.properties.find(
            (obj) => obj.property.propertyID === propertyID,
          );
          const { configuration, propertyName } = propertyData.property;
          const getUserRoleLevel = await db.query(
            sql.getUserRoleLevel(apiVersion),
            {
              usersID,
              dbEncryptKey,
            },
            configuration,
          );
          const userRoleLevel =
            getUserRoleLevel.length == 0 ? 6 : getUserRoleLevel[0]['roleLevel'];
          await Promise.all(
            roles.map(async (roles) => {
              let errorRemarks = '';
              const { roleID, privileges } = roles.role;
              const getRoleLevel = await db.query(
                sql.getRoleLevel(apiVersion),
                {
                  roleID,
                  dbEncryptKey,
                },
                configuration,
              );
              const roleLevel =
                getRoleLevel.length == 0 ? 6 : getRoleLevel[0]['roleLevel'];
              if (userRoleLevel == 6) errorRemarks = 'Invalid User Role ID';
              else if (roleLevel == 6) errorRemarks = 'User Role ID not found';
              else if (userRoleLevel >= roleLevel)
                errorRemarks = 'Cannot update role with the same/higher Level';
              else {
                const jsonData = new Array();
                privileges.map((privileges) => {
                  const { privID, moduleID } = privileges.privilege;
                  jsonData.push({ privID, moduleID });
                });
                await db.query(
                  sql.updatePrivOfUserRole(apiVersion),
                  {
                    roleID,
                    usersID,
                    jsonData,
                  },
                  configuration,
                );
              }
              if (errorRemarks !== '')
                errorData.push({
                  error: {
                    propertyName,
                    remarks: errorRemarks,
                    data: roles.role,
                  },
                });
            }),
          );
        }),
      );
    }
    const status = errorData.length == 0 ? 200 : 400;
    return {
      status: status,
      data: status == 200 ? {} : { error_message: errorData },
      message: status == 200 ? 'success' : 'error',
    };
  } catch (err) {
    return {
      status: 599,
      data: {
        error_message: err.toString(),
      },
      message: 'error',
    };
  }
}
*/

module.exports = {
  // updateUserRolePrivileges,
  createUserRoles,
  updateUserRole,
  getUserRoles,
};
