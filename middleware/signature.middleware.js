const verify = require('../utils/signature.utils');

const businessBlock = async (req, res, next) => {
  const {
    title,
    businessType,
    dateStart,
    reservationType,
    packageDescription,
    signature,
  } = req.body;
  const body = {
    rawData:
      title + businessType + dateStart + reservationType + packageDescription,
    signature: signature,
  };
  await verify(body, (err, status) => {
    if (!status) {
      res.status(401).send({
        status: 401,
        message: 'Invalid data signature for Business Block',
        data: err,
      });
    } else {
      next();
    }
  }).catch((err) => console.log(err));
};

module.exports = {
  businessBlock,
};
