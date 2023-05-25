const express = require('express');
const router = express.Router();
const jwtAuthenticate = require('../middleware/jwtAuth.middleware');
const versionAuth = require('../middleware/apiVersionChecker.middleware');
const validate = require('../modules/businessBlock.modules/businessBlock.validation');
const verifySignature = require('../modules/businessBlock.modules/businessBlock.signature');
const businessBlocks = require('../modules/businessBlock.modules/businessBlock.process');

/* GET Business Blocks */
router.get(
  '/:v/business-blocks/',
  versionAuth,
  jwtAuthenticate,
  async function (req, res, next) {
    try {
      res.json(
        await businessBlocks.getMultipleData(
          req.params.v,
          req.query.page,
          req.query.listPerPage,
        ),
      );
    } catch (err) {
      console.error(`Error while getting Business Blocks`, err.message);
      next(err);
    }
  },
);

router.get(
  '/:v/business-blocks/:id',
  jwtAuthenticate,
  async function (req, res, next) {
    try {
      res.json(
        await businessBlocks.getDataByID(
          req.params.v,
          req.params.id,
          req.query.page,
          req.query.listPerPage,
        ),
      );
    } catch (err) {
      console.error(`Error while getting Business Blocks`, err.message);
      next(err);
    }
  },
);

router.patch(
  '/:v/business-blocks/:id',
  jwtAuthenticate,
  validate.businessBlock,
  verifySignature.businessBlock,
  async function (req, res, next) {
    try {
      res.json(
        await businessBlocks.update(req.params.v, req.params.id, req.body),
      );
    } catch (err) {
      console.error(`Error while updating Business Block`, err.message);
      next(err);
    }
  },
);

module.exports = router;
