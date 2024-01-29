const db = require('../../utils/dbAction.utils'),
  sql = require('./dashboard.sql'),
  config = require('../../config/configuration');

async function usersManagement(apiVersion, propertyID, userData) {
  try {
    const { usersID } = userData;
    const errors = new Array(),
      arrayPieRole = new Array(),
      arrayUsersWithoutRoles = new Array(),
      arrayNewUsers = new Array(),
      arraySessions = new Array(),
      arrayRolesWithoutPrivs = new Array(),
      arrayBarData = new Array(),
      dbEncryptKey = config.database.encryptKey;
    let sumActiveUsers = 0,
      sumInactiveUsers = 0,
      sumActiveRoles = 0,
      sumInactiveRoles = 0,
      sumUsersWithRoles = 0,
      sumUsersWithoutRoles = 0,
      userRoles,
      usersWithoutRoles,
      newUsers,
      rolesWithoutPrivs;
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
      await Promise.all(
        requestPropertyIDs.map(async (propertyID) => {
          const propertyData = userData.properties.find(
            (obj) => obj.property.propertyID === propertyID,
          );
          const { configuration, propertyName } = propertyData.property;
          const getUserPropertyData = await db.query(
            sql.usersManagement(apiVersion),
            { dbEncryptKey },
            configuration,
          );
          if (getUserPropertyData.length > 0) {
            const {
              activeUsers,
              inactiveUsers,
              activeRoles,
              inactiveRoles,
              usersWithRoles,
              usersWithoutRoles,
              pieRoleData,
              tableUserWithOutRoles,
              tableNewlyAddedUsers,
              tableRolesWithoutPrivs,
            } = getUserPropertyData[0];
            arrayBarData.push({
              property: {
                activeUsers,
                usersWithRoles,
                usersWithoutRoles,
                name: propertyName,
              },
            });
            sumActiveUsers += parseInt(activeUsers);
            sumInactiveUsers += parseInt(inactiveUsers);
            sumActiveRoles += parseInt(activeRoles);
            sumInactiveRoles += parseInt(inactiveRoles);
            sumUsersWithRoles += parseInt(usersWithRoles);
            sumUsersWithoutRoles += parseInt(usersWithoutRoles);
            if (pieRoleData) {
              pieRoleData.map((pieData) => {
                arrayPieRole.push(pieData);
              });
            }
            if (tableUserWithOutRoles) {
              tableUserWithOutRoles.map((usersWORoles) => {
                arrayUsersWithoutRoles.push(usersWORoles);
              });
            }
            if (tableNewlyAddedUsers) {
              tableNewlyAddedUsers.map((newlyAddedUsers) => {
                arrayNewUsers.push(newlyAddedUsers);
              });
            }
            if (tableRolesWithoutPrivs) {
              tableRolesWithoutPrivs.map((rolesWOPriv) => {
                arrayRolesWithoutPrivs.push(rolesWOPriv);
              });
            }
          }
        }),
      );
      const getUserSessionData = await db.query(
        sql.usersManagementSessions(apiVersion),
        { requestPropertyIDs },
      );
      if (getUserSessionData.length > 0) {
        const { tableActiveSessions } = getUserSessionData[0];
        if (tableActiveSessions) {
          tableActiveSessions.map((activeSessions) => {
            arraySessions.push({ userSession: activeSessions });
          });
        }
      }
      userRoles = Array.from(
        arrayPieRole.reduce(
          (m, { label, value }) => m.set(label, (m.get(label) || 0) + value),
          new Map(),
        ),
        ([label, value]) => ({ userRole: { label, value } }),
      );
      usersWithoutRoles = Array.from(
        arrayUsersWithoutRoles.reduce(
          (m, { user, userID }) => m.set(user, userID),
          new Map(),
        ),
        ([user, userID]) => ({ userWithoutRole: { user, userID } }),
      );
      rolesWithoutPrivs = Array.from(
        arrayRolesWithoutPrivs.reduce(
          (m, { roleID, description }) => m.set(roleID, description),
          new Map(),
        ),
        ([roleID, description]) => ({
          roleWithoutPrivs: { roleID, description },
        }),
      );
      newUsers = Array.from(
        arrayNewUsers.reduce(
          (m, { user, userID }) => m.set(user, userID),
          new Map(),
        ),
        ([user, userID]) => ({ newUser: { user, userID } }),
      );
    }
    const status = errors.length == 0 ? 200 : 400;
    return {
      status: status,
      data:
        status == 200
          ? {
              count: {
                usersActive: sumActiveUsers,
                usersInactive: sumInactiveUsers,
                rolesActive: sumActiveRoles,
                rolesInactive: sumInactiveRoles,
                usersWithRoles: sumUsersWithRoles,
                usersWithoutRoles: sumUsersWithoutRoles,
              },
              userRoles,
              usersWithoutRoles,
              newUsers,
              rolesWithoutPrivs,
              userSessions: arraySessions,
              propertyGeneralData: arrayBarData,
            }
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

module.exports = {
  usersManagement,
};
