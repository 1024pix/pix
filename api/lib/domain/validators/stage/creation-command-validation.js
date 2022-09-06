const Joi = require('joi');
const { EntityValidationError } = require('../../errors');

const schema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required(),
  level: Joi.when('threshold', [{ is: null, then: Joi.number().required(), otherwise: Joi.any().valid(null) }]),
  threshold: Joi.number().required().allow(null),
  targetProfileId: Joi.number().required(),
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
