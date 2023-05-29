const validator = require('../../middleware/validate.middleware');
/*
Available validators are found here: https://www.npmjs.com/package/validatorjs
*/

const businessBlock = async (req, res, next) => {
  // console.log(req.params.v);
  const validationRule = {
    title: 'present|required|string|email|between:1,300',
    businessType: 'present|required|integer',
    dateStart: 'present|required|date',
    reservationType: 'present|required|integer|min:2|max:5',
    packageDescription: 'present|required|string',
    signature: 'present|required|string',
  };
  await validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      res.status(412).send({
        status: 412,
        message: 'error',
        data: { 'error message': 'Validation Failed', errors: err['errors'] },
      });
    } else {
      next();
    }
  }).catch((err) => console.log(err));
};

module.exports = {
  businessBlock,
};
