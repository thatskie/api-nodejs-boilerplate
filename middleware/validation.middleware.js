const validator = require('../utils/validate.utils');
/*
Available validators are found here: https://www.npmjs.com/package/validatorjs
*/

const businessBlock = async (req, res, next) => {
  const validationRule = {
    title: 'required|string|email|between:1,30',
    businessType: 'required|integer',
    dateStart: 'required|date',
    reservationType: 'required|integer|min:2|max:5',
    packageDescription: 'required|string',
    signature: 'present|required|string',
  };

  await validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        status: 412,
        message: 'Validation failed',
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
