const express = require('express');
const router = express.Router();

router.use(
  '/business-blocks',
  require('../controllers/businessBlock.controller'),
);

router.use('/authentication', require('../controllers/auth.controllers'));

module.exports = router;
