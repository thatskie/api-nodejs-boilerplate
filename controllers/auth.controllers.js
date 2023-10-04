const express = require('express');
const router = express.Router();
const validateAPIVersion = require('../middleware/apiVersionChecker.middleware');
const validateForm = require('../modules/auth.modules/auth.validation');
const verifySignature = require('../modules/auth.modules/auth.signature');
const authentication = require('../modules/auth.modules/auth.process');

router.get(
  '/:v/authentication/',
  validateAPIVersion,
  validateForm,
  verifySignature,
  async function (req, res, next) {
    try {
      res.json(await authentication.createToken(req.params.v, req.body));
    } catch (err) {
      console.error(`Error logging-in in the system`, err.message);
      next(err);
    }
  },
);

module.exports = router;
