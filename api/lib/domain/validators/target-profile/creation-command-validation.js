const Joi = require('joi');
const { schema: base } = require('./base-validation.js');
const { EntityValidationError } = require('../../errors.js');

const schema = base.keys({
  description: Joi.string().allow(null),
  comment: Joi.string().allow(null),
  isPublic: Joi.boolean().required(),
  imageUrl: Joi.string().allow(null),
  ownerOrganizationId: Joi.number().allow(null).default(null),
  tubes: Joi.array()
    .items({
      id: Joi.string().required(),
      level: Joi.number().required(),
    })
    .min(1)
    .required(),
});

function validate(creationCommand) {
  const { error } = schema.validate(creationCommand, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return true;
}

module.exports = {
  validate,
};
