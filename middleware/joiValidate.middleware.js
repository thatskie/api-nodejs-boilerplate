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
      const errors = new Array();
      details.map((i) =>
        errors.push({ error: { remarks: i.message, field: i.context.key } }),
      );
      res.status(412).json({
        status: 412,
        message: 'error',
        data: {
          error_message: 'Data validation failed!',
          level: 2,
          errors,
        },
      });
    }
  };
};
module.exports = validator;
