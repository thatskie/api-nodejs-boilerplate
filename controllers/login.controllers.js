const express = require('express');
const router = express.Router();
const validateAPIVersion = require('../middleware/apiVersionChecker.middleware');
const validateForm = require('../modules/login.modules/login.validation');
const verifySignature = require('../modules/login.modules/login.signature');
const login = require('../modules/login.modules/login.process');

router.post(
  '/:v/login/userCredentials',
  validateAPIVersion,
  validateForm,
  verifySignature,
  async function (req, res, next) {
    try {
      res.json(await login.viaUserCredentials(req.params.v, req.body));
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

module.exports = router;
