const config = require('../../config/configuration');
const Joi = require('joi');
const crypto = require('crypto');
const validator = require('../../middleware/joiValidate.middleware');

const createRolesSchema = Joi.object({
  properties: Joi.array()
    .items(
      Joi.object().keys({
        property: Joi.object().keys({
          propertyID: Joi.string().min(36).max(36).required(),
          roles: Joi.array()
            .items(
              Joi.object().keys({
                role: Joi.object()
                  .keys({
                    description: Joi.string().min(2).max(100).required(),
                    level: Joi.number().valid(0, 1, 2, 3, 4, 5).required(),
                    signature: Joi.string().required(),
                    privileges: Joi.array().items(
                      Joi.object().keys({
                        privilege: Joi.object()
                          .keys({
                            privID: Joi.number(),
                            moduleID: Joi.number().when('privID', {
                              is: Joi.exist(),
                              then: Joi.required(),
                            }),
                            privCode: Joi.string(),
                            moduleCode: Joi.string().when('privCode', {
                              is: Joi.exist(),
                              then: Joi.required(),
                            }),
                            signature: Joi.string().required(),
                            thisDescription: Joi.string().default(
                              Joi.ref('description', { ancestor: 4 }),
                            ),
                          })
                          .xor('moduleID', 'moduleCode')
                          .custom((fields, helpers) => {
                            const {
                              privID,
                              moduleID,
                              privCode,
                              moduleCode,
                              signature,
                              thisDescription,
                            } = fields;
                            const {
                              state: { ancestors: data },
                            } = helpers;
                            const propertyID =
                              data[data.findIndex((item) => item.propertyID)]
                                .propertyID;
                            const hash = crypto
                              .createHash('sha512')
                              .update(
                                propertyID +
                                  thisDescription +
                                  (privID ?? '') +
                                  (moduleID ?? '') +
                                  (privCode ?? '') +
                                  (moduleCode ?? ''),
                              )
                              .digest('hex');
                            if (signature === hash) {
                              return fields;
                            } else {
                              return helpers.message({
                                custom:
                                  '{{#label}} has an invalid data signature (propertyID + `role.description` + (privID OR privCode) + (moduleID OR moduleCode)).' +
                                  (config.isDevelopment
                                    ? ' Valid: ' + hash
                                    : ''),
                              });
                            }
                          }),
                      }),
                    ),
                  })
                  .custom((fields, helpers) => {
                    const { description, level, signature } = fields;
                    const {
                      state: { ancestors: data },
                    } = helpers;
                    const propertyID =
                      data[data.findIndex((item) => item.propertyID)]
                        .propertyID;
                    const hash = crypto
                      .createHash('sha512')
                      .update(propertyID + description + level)
                      .digest('hex');
                    if (signature === hash) {
                      return fields;
                    } else {
                      return helpers.message({
                        custom:
                          '{{#label}} has an invalid data signature (propertyID + description + level).' +
                          (config.isDevelopment ? ' Valid: ' + hash : ''),
                      });
                    }
                  }),
              }),
            )
            .required(),
        }),
      }),
    )
    .min(1)
    .required(),
  // signature: Joi.string().required(),
});

const updateRolesSchema = Joi.object({
  properties: Joi.array()
    .items(
      Joi.object().keys({
        property: Joi.object().keys({
          propertyID: Joi.string().min(36).max(36).required(),
          roles: Joi.array()
            .items(
              Joi.object().keys({
                role: Joi.object()
                  .keys({
                    roleID: Joi.string().min(36).max(36).required(),
                    description: Joi.string().min(2).max(100),
                    isActive: Joi.boolean(),
                    level: Joi.number().valid(0, 1, 2, 3, 4, 5),
                    signature: Joi.string().required(),
                    privileges: Joi.array().items(
                      Joi.object().keys({
                        privilege: Joi.object()
                          .keys({
                            privID: Joi.number().required(),
                            moduleID: Joi.number().required(),
                            signature: Joi.string().required(),
                            thisRoleID: Joi.string().default(
                              Joi.ref('roleID', { ancestor: 4 }),
                            ),
                          })
                          .custom((fields, helpers) => {
                            const { privID, moduleID, signature, thisRoleID } =
                              fields;
                            const {
                              state: { ancestors: data },
                            } = helpers;
                            const propertyID =
                              data[data.findIndex((item) => item.propertyID)]
                                .propertyID;
                            const hash = crypto
                              .createHash('sha512')
                              .update(
                                propertyID + thisRoleID + privID + moduleID,
                              )
                              .digest('hex');
                            if (signature === hash) {
                              return fields;
                            } else {
                              return helpers.message({
                                custom:
                                  '{{#label}} has an invalid data signature (propertyID + `role.roleID` + privID + moduleID).' +
                                  (config.isDevelopment
                                    ? ' Valid: ' + hash
                                    : ''),
                              });
                            }
                          }),
                      }),
                    ),
                  })
                  .or('description', 'level', 'privileges', 'isActive')
                  .custom((fields, helpers) => {
                    const { roleID, description, isActive, level, signature } =
                      fields;
                    const {
                      state: { ancestors: data },
                    } = helpers;
                    const propertyID =
                      data[data.findIndex((item) => item.propertyID)]
                        .propertyID;
                    const hash = crypto
                      .createHash('sha512')
                      .update(
                        propertyID +
                          roleID +
                          (description ?? '') +
                          (isActive ? 1 : 0) +
                          (level ?? ''),
                      )
                      .digest('hex');
                    if (signature === hash) {
                      return fields;
                    } else {
                      return helpers.message({
                        custom:
                          '{{#label}} has an invalid data signature (propertyID + roleID + description + (isActive ? 1 : 0) + level).' +
                          (config.isDevelopment ? ' Valid: ' + hash : ''),
                      });
                    }
                  }),
              }),
            )
            .required(),
        }),
      }),
    )
    .min(1)
    .required(),
});

/*
const updatePrivilegesOnRolesSchema = Joi.object({
  properties: Joi.array()
    .items(
      Joi.object().keys({
        property: Joi.object().keys({
          propertyID: Joi.string().min(36).max(36).required(),
          roles: Joi.array()
            .items(
              Joi.object().keys({
                role: Joi.object().keys({
                  roleID: Joi.string().min(36).max(36).required(),
                  privileges: Joi.array()
                    .items(
                      Joi.object().keys({
                        privilege: Joi.object()
                          .keys({
                            privID: Joi.number().required(),
                            moduleID: Joi.number().required(),
                            signature: Joi.string().required(),
                            thisRoleID: Joi.string().default(
                              Joi.ref('roleID', { ancestor: 4 }),
                            ),
                          })
                          .custom((fields, helpers) => {
                            const { privID, moduleID, signature, thisRoleID } =
                              fields;
                            const {
                              state: { ancestors: data },
                            } = helpers;
                            const propertyID =
                              data[data.findIndex((item) => item.propertyID)]
                                .propertyID;
                            const hash = crypto
                              .createHash('sha512')
                              .update(
                                propertyID + thisRoleID + privID + moduleID,
                              )
                              .digest('hex');
                            if (signature === hash) {
                              return fields;
                            } else {
                              return helpers.message({
                                custom:
                                  '{{#label}} has an invalid data signature (propertyID + roleID + privID + moduleID).' +
                                  (config.isDevelopment
                                    ? ' Valid: ' + hash
                                    : ''),
                              });
                            }
                          }),
                      }),
                    )
                    .required(),
                }),
              }),
            )
            .required(),
        }),
      }),
    )
    .min(1)
    .required(),
});
const updatePrivilegesOnUserRoles = validator(updatePrivilegesOnRolesSchema);
*/

const createUserRoles = validator(createRolesSchema);
const updateUserRoles = validator(updateRolesSchema);
module.exports = {
  createUserRoles,
  updateUserRoles,
  // updatePrivilegesOnUserRoles,
};
