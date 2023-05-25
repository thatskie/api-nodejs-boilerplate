const validator = require('../../middleware/validate.middleware');
/*
Available validators are found here: https://www.npmjs.com/package/validatorjs
*/

const jwtAuthentication = async (req, res, next) => {
  const validationRule = {
    username: 'present|required|string',
    password: 'present|required|string',
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
  jwtAuthentication,
};
