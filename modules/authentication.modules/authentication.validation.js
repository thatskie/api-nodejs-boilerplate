const Joi = require('joi');
const validator = require('../../middleware/joiValidate.middleware');
const authSchema = Joi.object({
  username: Joi.string().required().min(3).max(120),
  password: Joi.string().required().min(3).max(120),
  signature: Joi.string().required(),
});
const validateSchema = validator(authSchema);
module.exports = validateSchema;
