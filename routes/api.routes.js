const express = require('express');
const router = express.Router();

router.use('/', require('../controllers/businessBlock.controller'));
router.use('/', require('../controllers/auth.controllers'));

module.exports = router;
