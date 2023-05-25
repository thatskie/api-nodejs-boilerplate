const express = require('express');
const router = express.Router();
const versionAuth = require('../middleware/apiVersionChecker.middleware');
const validate = require('../modules/auth.modules/auth.validation');
const authentication = require('../modules/auth.modules/auth.process');

router.get(
  '/:v/authentication/',
  versionAuth,
  validate.jwtAuthentication,
  async function (req, res, next) {
    try {
      res.json(await authentication.createToken(req.body));
    } catch (err) {
      console.error(`Error while getting Business Blocks`, err.message);
      next(err);
    }
  },
);

// router.post('/welcome', auth, async function (req, res, next) {
//   res.status(200).send('Welcome 🙌 ');
// });

module.exports = router;
