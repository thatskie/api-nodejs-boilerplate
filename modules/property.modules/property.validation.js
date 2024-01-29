const config = require('../../config/configuration');
const Joi = require('joi');
const crypto = require('crypto');
const validator = require('../../middleware/joiValidate.middleware');

const selfRegistrationSchema = Joi.object({
  properties: Joi.array()
    .items(
      Joi.object().keys({
        property: Joi.object()
          .keys({
            propertyID: Joi.string().min(36).max(36).required(),
            selfRegistration: Joi.boolean().required(),
            signature: Joi.string().required(),
          })
          .custom((fields, helpers) => {
            const { propertyID, selfRegistration, signature } = fields;
            const hash = crypto
              .createHash('sha512')
              .update(propertyID + (selfRegistration ? 1 : 0))
              .digest('hex');
            if (signature === hash) {
              return fields;
            } else {
              return helpers.message({
                custom:
                  '{{#label}} has an invalid data signature (propertyID + (selfRegistration ? 1 : 0)).' +
                  (config.isDevelopment ? ' Valid: ' + hash : ''),
              });
            }
          }),
      }),
    )
    .min(1)
    .required(),
  // signature: Joi.string().required(),
});

const selfRegistration = validator(selfRegistrationSchema);
module.exports = {
  selfRegistration,
};
