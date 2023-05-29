/*
Available validators are found here: https://joi.dev/api/?v=17.9.
Note: All validation should contain `required()` validation. For validations that allows null value include `allow('')` validation;
*/
const Joi = require('joi');
const validator = require('../../middleware/joiValidate.middleware');
const businessBlockSchema = Joi.object({
  title: Joi.string().min(3).min(5).required(),
  dateStart: Joi.date().min('now').required(),
  dateEnd: Joi.date().greater(Joi.ref('dateStart')).required(),
  email: Joi.string().email().required(),
  comment: Joi.string().min(3).max(10).required().allow(''),
  businessType: Joi.number().min(1).max(5).required(),
  packageDescription: Joi.string().required().allow(''),
  reservationType: Joi.number().min(1).max(5).required(),
  events: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().alphanum().min(3).max(10).required(),
        quantity: Joi.number().min(1).max(5).required().allow(''),
        eventName: Joi.array()
          .items(
            Joi.object({
              venue: Joi.string().required(),
              date: Joi.date().required(),
            }),
          )
          .has(Joi.object({ venue: Joi.string(), date: Joi.date() }))
          .required(),
      }),
    )
    .has(
      Joi.object({
        title: Joi.string(),
        quantity: Joi.number(),
        eventName: Joi.array(),
      }),
    )
    .required(),
  signature: Joi.string().required(),
});
// const businessBlockSchema = Joi.object({
//   title: Joi.string().email().min(3).max(15),
//   businessType: Joi.string().email().min(3).max(15),
//   dateStart: Joi.string(),
//   reservationType: Joi.string(),
//   packageDescription: Joi.string(),
//   // events: Joi.required()
//   //   .array()
//   //   .items(
//   //     Joi.object.keys({
//   //       name: Joi.required().allow('').string().alphanum(),
//   //       quantity: Joi.required().number().min(1).max(5),
//   //     }),
//   //   ),
//   signature: Joi.string(),
// });
const validateSchema = validator(businessBlockSchema);
module.exports = validateSchema;
