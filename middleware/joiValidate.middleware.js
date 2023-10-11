const Joi = require('joi');
const validator = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(!property ? req.body : req[property], {
      abortEarly: false,
    });
    if (!error) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message);
      res.status(412).json({
        status: 412,
        message: 'error',
        data: {
          'error message': 'Data validation failed!',
          errors: message,
        },
      });
    }
  };
};
module.exports = validator;
