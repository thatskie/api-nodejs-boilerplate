const express = require('express');
const router = express.Router();
const businessBlocks = require('../services/businessBlock.services');
const validate = require('../middleware/validation.middleware');
const jwtAuthenticate = require('../middleware/jwtAuth.middleware');
const verifySignature = require('../middleware/signature.middleware');

/* GET Business Blocks */
router.get('/', jwtAuthenticate, async function (req, res, next) {
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

router.get('/:id', jwtAuthenticate, async function (req, res, next) {
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

router.patch(
  '/:id',
  jwtAuthenticate,
  validate.businessBlock,
  verifySignature.businessBlock,
  async function (req, res, next) {
    try {
      res.json(await businessBlocks.update(req.params.id, req.body));
    } catch (err) {
      console.error(`Error while updating Business Block`, err.message);
      next(err);
    }
  },
);

module.exports = router;
