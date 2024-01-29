const express = require('express'),
  router = express.Router(),
  checkSession = require('../middleware/verifySession.middleware'),
  jwtAuthenticate = require('../middleware/jwtAuth.middleware'),
  validateAPIVersion = require('../middleware/apiVersionChecker.middleware'),
  dashboards = require('../modules/dashboard.modules/dashboard.process'),
  config = require('../config/configuration');

//Get Dashboard Data Users Managment
router.get(
  '/:v/dashboards/usersManagement/:propertyID?',
  checkSession,
  jwtAuthenticate,
  validateAPIVersion,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await dashboards.usersManagement(
        req.params.v,
        req.params.propertyID ? req.params.propertyID : null,
        req.user.userData,
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

module.exports = router;
