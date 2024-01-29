const config = require('../../config/configuration');
const Joi = require('joi');
const crypto = require('crypto');
const validator = require('../../middleware/joiValidate.middleware');
const authSchema = Joi.object({
  username: Joi.string().required().min(3).max(45),
  password: Joi.string().required().min(3).max(45),
  signature: Joi.string().required(),
}).custom((fields, helpers) => {
  const { username, password, signature } = fields;
  const hash = crypto
    .createHash('sha512')
    .update(username + password)
    .digest('hex');
  if (signature === hash) {
    return fields;
  } else {
    return helpers.message({
      custom:
        'Invalid data signature (username + password).' +
        (config.isDevelopment ? ' Valid: ' + hash : ''),
    });
  }
});
const sessionSchema = Joi.object({
  verificationCode: Joi.string().required().length(4),
  sessionID: Joi.string().required().min(3).max(45),
  signature: Joi.string().required(),
}).custom((fields, helpers) => {
  const { verificationCode, sessionID, signature } = fields;
  const hash = crypto
    .createHash('sha512')
    .update(verificationCode + sessionID)
    .digest('hex');
  if (signature === hash) {
    return fields;
  } else {
    return helpers.message({
      custom:
        'Invalid data signature (verificationCode + sessionID).' +
        (config.isDevelopment ? ' Valid: ' + hash : ''),
    });
  }
});

const validateSchema = validator(authSchema);
const validateSession = validator(sessionSchema);

module.exports = {
  validateSchema,
  validateSession,
};
