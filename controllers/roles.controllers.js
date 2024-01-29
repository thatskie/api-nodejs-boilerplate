const express = require('express'),
  router = express.Router(),
  checkSession = require('../middleware/verifySession.middleware'),
  jwtAuthenticate = require('../middleware/jwtAuth.middleware'),
  validateAPIVersion = require('../middleware/apiVersionChecker.middleware'),
  validateForm = require('../modules/roles.modules/roles.validation'),
  roles = require('../modules/roles.modules/roles.process'),
  config = require('../config/configuration');

//Create User Roles
router.post(
  '/:v/roles',
  checkSession,
  jwtAuthenticate,
  validateAPIVersion,
  validateForm.createUserRoles,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await roles.createUserRoles(
        req.params.v,
        req.user.userData,
        req.body,
      );
      response.buildVersion = config.apiVersion;
      // response.data.uniqueID = req.generatedUUID;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

// Update User Roles
router.put(
  '/:v/roles',
  checkSession,
  jwtAuthenticate,
  validateAPIVersion,
  validateForm.updateUserRoles,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await roles.updateUserRole(
        req.params.v,
        req.user.userData,
        req.body,
      );
      response.buildVersion = config.apiVersion;
      // response.data.uniqueID = req.generatedUUID;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

//Get Roles
router.get(
  '/:v/roles/:propertyID?/:roleID?',
  checkSession,
  jwtAuthenticate,
  validateAPIVersion,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await roles.getUserRoles(
        req.params.v,
        req.user.userData,
        req.params.propertyID,
        req.params.roleID,
      );
      response.buildVersion = config.apiVersion;
      // response.data.uniqueID = req.generatedUUID;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error while retrieving User Roles`, err.message);
      next(err);
    }
  },
);

/*
//Update Privileges of User Roles
router.put(
  '/:v/roles/privileges',
  checkSession,
  jwtAuthenticate,
  validateAPIVersion,
  validateForm.updatePrivilegesOnUserRoles,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await roles.updateUserRolePrivileges(
        req.params.v,
        req.user.userData,
        req.body,
      );
      response.buildVersion = config.apiVersion;
      // response.data.uniqueID = req.generatedUUID;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(
        `Error while retrieving Privileges of User Roles`,
        err.message,
      );
      next(err);
    }
  },
);
*/

module.exports = router;
