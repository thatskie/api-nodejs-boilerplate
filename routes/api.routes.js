const express = require('express');
const router = express.Router();

router.use('/', require('../controllers/roles.controllers'));
router.use('/', require('../controllers/dashboards.controllers'));


module.exports = router;
