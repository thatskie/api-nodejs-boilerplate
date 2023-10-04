const express = require('express');
const router = express.Router();

router.use('/', require('../controllers/login.controllers'));

module.exports = router;
