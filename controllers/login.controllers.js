const express = require('express');
const passport = require('passport');
const router = express.Router();
const validateAPIVersion = require('../middleware/apiVersionChecker.middleware');
const validateForm = require('../modules/authentication.modules/authentication.validation');
const verifySignature = require('../modules/authentication.modules/authentication.signature');
// const createVerifiedCookie = require('../middleware/passportCookieCombo.middleware');
const login = require('../modules/authentication.modules/authentication.process');
const jwt = require('jsonwebtoken');
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

//Check User
//http://127.0.0.1:3000/api/v1.0.0/login/user
router.get(
  '/:v/login/user',
  // passport.authenticate('jwt-cookiecombo', {
  //   session: false,
  // }),
  function (req, res, next) {
    try {
      // console.log(req.session.passport.user);
      console.log(req.signedCookies['servo-jwt']);
      const status = 200;
      const message = 'success';
      const data = req.session.passport.user;
      res.status(status).json({
        status,
        message,
        data,
      });
    } catch (ex) {
      console.log(ex);
    }
  },
);

//Failure Log In
router.get('/:v/login/failed', function (req, res, next) {
  // console.log(req.session);
  const errorMessage =
    req.session && req.session.messages
      ? req.session.messages.pop()
      : 'Log in Failed';
  res.status(401).json({
    status: 401,
    message: 'error',
    data: {
      'error message': errorMessage,
    },
  });
});

//Log In using Username/Email and Password combination
//http://127.0.0.1:3000/api/v1.0.0/login/userCredentials
router.post(
  '/:v/login/userCredentials',
  validateAPIVersion,
  validateForm,
  verifySignature,
  passport.authenticate('local', {
    passReqToCallback: true,
    failureRedirect: '/api/v1.0.0/login/failed',
    failureMessage: true,
  }),
  // createVerifiedCookie,
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session);
      const response = await login.viaUserUUID(req.params.v, req.session);
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
//http://127.0.0.1:3000/api/v1.0.0/login/google
router.get(
  '/:v/login/google',
  validateAPIVersion,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    failureRedirect: '/api/v1.0.0/login/failed',
    failureMessage: true,
  }),
);

router.get(
  '/:v/login/google/callback',
  validateAPIVersion,
  passport.authenticate('google', {
    passReqToCallback: true,
    failureRedirect: '/api/v1.0.0/login/failed',
    failureMessage: true,
  }),
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session);
      const response = await login.viaUserUUID(req.params.v, req.session);
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
//http://127.0.0.1:3000/api/v1.0.0/login/microsoft
router.get(
  '/:v/login/microsoft',
  validateAPIVersion,
  passport.authenticate('microsoft', { prompt: 'select_account' }),
);

router.get(
  '/:v/login/microsoft/callback',
  validateAPIVersion,
  passport.authenticate('microsoft', {
    passReqToCallback: true,
    failureRedirect: '/api/v1.0.0/login/failed',
    failureMessage: true,
  }),
  async function (req, res, next) {
    try {
      // console.log(req.user, req.sessionID, req.session);
      const response = await login.viaUserUUID(req.params.v, req.session);
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

module.exports = router;
