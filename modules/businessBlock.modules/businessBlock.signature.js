const verify = require('../../middleware/signature.middleware');

const businessBlock = async (req, res, next) => {
  const {
    title,
    businessType,
    dateStart,
    reservationType,
    packageDescription,
    signature,
  } = req.body;
  // console.log(req.params.v);
  const body = {
    rawData:
      title + businessType + dateStart + reservationType + packageDescription,
    signature: signature,
  };
  await verify(body, 'Business Block', (err, status) => {
    if (!status) {
      res.status(401).send({
        status: 401,
        message: 'error',
        data: err,
      });
    } else {
      next();
    }
  }).catch((err) => console.log(err));
};

module.exports = businessBlock;
