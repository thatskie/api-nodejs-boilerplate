const Joi = require('joi');
const validator = require('../../middleware/joiValidate.middleware');
const authSchema = Joi.object({
  // username: Joi.string().required().min(3).max(15),
  username: Joi.string().required().min(3).max(15),
  password: Joi.string().required().min(3).max(15),
});
const validateSchema = validator(authSchema);
module.exports = validateSchema;
