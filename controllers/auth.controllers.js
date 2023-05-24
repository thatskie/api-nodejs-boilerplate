const express = require('express');
const router = express.Router();
const authentication = require('../services/auth.services');

router.post('/', async function (req, res, next) {
  try {
    res.json(await authentication.createToken(req.body));
  } catch (err) {
    console.error(`Error while getting Business Blocks`, err.message);
    next(err);
  }
});

// router.post('/welcome', auth, async function (req, res, next) {
//   res.status(200).send('Welcome 🙌 ');
// });

module.exports = router;
