const express = require('express');
const router = express.Router();
const businessBlocks = require('../services/businessBlock.services');

/* GET Business Blocks */
router.post('/', async function (req, res, next) {
  try {
    res.json(
      await businessBlocks.getMultipleData(
        req.query.page,
        req.query.listPerPage,
      ),
    );
  } catch (err) {
    console.error(`Error while getting Business Blocks`, err.message);
    next(err);
  }
});

router.post('/:id', async function (req, res, next) {
  try {
    res.json(
      await businessBlocks.getDataByID(
        req.params.id,
        req.query.page,
        req.query.listPerPage,
      ),
    );
  } catch (err) {
    console.error(`Error while getting Business Blocks`, err.message);
    next(err);
  }
});

router.put('/:id', async function (req, res, next) {
  try {
    res.json(await businessBlocks.update(req.params.id, req.body));
  } catch (err) {
    console.error(`Error while updating Business Block`, err.message);
    next(err);
  }
});

module.exports = router;
