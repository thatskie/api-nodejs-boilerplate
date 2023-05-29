const express = require('express');
const router = express.Router();
const validateAPIVersion = require('../middleware/apiVersionChecker.middleware');
const validateForm = require('../modules/auth.modules/auth.validation');
const authentication = require('../modules/auth.modules/auth.process');

router.get(
  '/:v/authentication/',
  validateAPIVersion,
  validateForm,
  async function (req, res, next) {
    try {
      res.json(await authentication.createToken(req.body));
    } catch (err) {
      console.error(`Error while getting Business Blocks`, err.message);
      next(err);
    }
  },
);

module.exports = router;
