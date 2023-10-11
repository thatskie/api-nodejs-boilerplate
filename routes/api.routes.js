const express = require('express');
const router = express.Router();

router.use('/', require('../controllers/authentication.controllers'));

module.exports = router;
