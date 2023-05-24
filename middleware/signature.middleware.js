const verify = require('../utils/signature.utils');

const businessBlock = async (req, res, next) => {
  const { title, signature } = req.body;
  const body = { rawData: title, signature: signature };
  await verify(body, (err, status) => {
    if (!status) {
      res.status(401).send({
        status: 401,
        message: 'Invalid data signature',
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
