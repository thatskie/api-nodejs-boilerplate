const express = require('express');
const passport = require('passport');
const router = express.Router();
const validateAPIVersion = require('../middleware/apiVersionChecker.middleware');
const checkClient = require('../middleware/clientDetection.middleware');
const validateForm = require('../modules/authentication.modules/authentication.validation');
const verifySignature = require('../modules/authentication.modules/authentication.signature');
// const createVerifiedCookie = require('../middleware/passportCookieCombo.middleware');
const login = require('../modules/authentication.modules/authentication.process');
const configuration = require('../config/configuration');

//Log Out
router.post('/:v/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

//Failure Log In
router.get('/:v/authentication/failed', async function (req, res, next) {
  try {
    if (req?.session?.messages) {
      res.status(401).json({
        status: 401,
        message: 'error',
        data: {
          'error message': req.session.messages.pop(),
        },
      });
    } else {
      const response = await login.getErrorMessage(req.params.v, req.sessionID);
      response.buildVersion = configuration.apiVersion;
      res.status(response['status']).send(response);
    }
  } catch (err) {
    console.error(`Error logging-in in the system`, err.message);
    next(err);
  }
});

//Log In using Username/Email and Password combination
//http://127.0.0.1:3000/api/v1.0.0/authentication/userCredentials
router.post(
  '/:v/authentication/userCredentials',
  validateAPIVersion,
  validateForm,
  verifySignature,
  passport.authenticate('local', {
    passReqToCallback: true,
    failureRedirect: '/api/v1.0.0/authentication/failed',
    failureMessage: true,
  }),
  // createVerifiedCookie,
  checkClient,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await login.viaUserUUID(
        req.params.v,
        req.session,
        req.userClient,
        1,
      );
      response.buildVersion = configuration.apiVersion;
      response.logInProcess = 'via Local Credentials';
      // response.data.uniqueID = req.generatedUUID;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

//Log In using Google Account
//http://127.0.0.1:3000/api/v1.0.0/authentication/google
router.get(
  '/:v/authentication/google',
  validateAPIVersion,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    failureRedirect: '/api/v1.0.0/authentication/failed',
    failureMessage: true,
  }),
);

router.get(
  '/:v/authentication/google/callback',
  validateAPIVersion,
  passport.authenticate('google', {
    passReqToCallback: true,
    failureRedirect: '/api/v1.0.0/authentication/failed',
    failureMessage: true,
  }),
  checkClient,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await login.viaUserUUID(
        req.params.v,
        req.session,
        req.userClient,
        2,
      );
      response.buildVersion = configuration.apiVersion;
      response.logInProcess = 'via Google Authentication';
      // response.data.uniqueID = req.generatedUUID;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

//Log In Using Microsoft
//http://127.0.0.1:3000/api/v1.0.0/authentication/microsoft
router.get(
  '/:v/authentication/microsoft',
  validateAPIVersion,
  passport.authenticate('microsoft', { prompt: 'select_account' }),
);

router.get(
  '/:v/authentication/microsoft/callback',
  validateAPIVersion,
  passport.authenticate('microsoft', {
    passReqToCallback: true,
    failureRedirect: '/api/v1.0.0/authentication/failed',
    failureMessage: true,
  }),
  checkClient,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await login.viaUserUUID(
        req.params.v,
        req.session,
        req.userClient,
        3,
      );
      response.buildVersion = configuration.apiVersion;
      response.logInProcess = 'via Google Authentication';
      // response.data.uniqueID = req.generatedUUID;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

//verify device
router.post(
  '/:v/authentication/device/:deviceID',
  validateAPIVersion,
  async function (req, res, next) {
    try {
      const response = await login.verifyDevice(
        req.params.v,
        req.params.deviceID,
      );
      response.buildVersion = configuration.apiVersion;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

//resend otp
router.post(
  '/:v/authentication/resendOTP',
  validateAPIVersion,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session, req.userClient);
      const response = await login.resendOTP(req.session);
      response.buildVersion = configuration.apiVersion;
      res.status(response['status']).send(response);
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

//Check User
//http://127.0.0.1:3000/api/v1.0.0/authentication/user
router.get(
  '/:v/authentication/user',
  validateAPIVersion,
  // passport.authenticate('jwt-cookiecombo', {
  //   session: false,
  // }),
  function (req, res, next) {
    try {
      // console.log(req.session.passport.user);
      // console.log(req.signedCookies['servo-jwt']);
      if (req.session?.passport?.user) {
        const status = 200;
        const message = 'success';
        const data = req.session.passport.user;
        res.status(status).json({
          status,
          message,
          data,
        });
      } else {
        res.status(401).json({
          status: 401,
          message: 'error',
          data: {
            'error message': 'Restricted Access',
          },
        });
      }
    } catch (ex) {
      console.log(ex);
    }
  },
);
module.exports = router;
