const express = require('express');
const router = express.Router();

router.use(
  '/business-blocks',
  require('../controllers/businessBlock.controller'),
);

module.exports = router;
