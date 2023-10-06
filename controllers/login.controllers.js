const express = require('express');
const passport = require('passport');
const router = express.Router();
const validateAPIVersion = require('../middleware/apiVersionChecker.middleware');
const validateForm = require('../modules/login.modules/login.validation');
const verifySignature = require('../modules/login.modules/login.signature');
const login = require('../modules/login.modules/login.process');

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
router.post('/:v/login/user', function (req, res, next) {
  // console.log(req.session);
  const status = 200;
  const message = 'success';
  const data = req.session.passport.user;
  res.status(status).json({
    status,
    message,
    data,
  });
});

//Failure Log In
router.get('/:v/login/failed', function (req, res, next) {
  // console.log(req.session);
  const errorMessage = req.session.messages.pop();
  res.status(401).json({
    status: 401,
    message: 'error',
    data: {
      'error message': errorMessage ? errorMessage : 'Log in Failed',
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
  async function (req, res, next) {
    try {
      // console.log(req.sessionID);
      // console.log(req.session);
      res.json(
        await login.viaUserUUID(
          req.params.v,
          req.session,
          req.sessionID,
          'Local Credentials',
        ),
      );
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
      res.json(
        await login.viaUserUUID(
          req.params.v,
          req.session,
          req.sessionID,
          'Google Authentication',
        ),
      );
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
    console.log(req);
    try {
      res.json(
        await login.viaUserUUID(
          req.params.v,
          req.session,
          req.sessionID,
          'Microsoft Authentication',
        ),
      );
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

module.exports = router;
