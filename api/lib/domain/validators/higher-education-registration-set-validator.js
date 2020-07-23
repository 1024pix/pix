const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const validationSchema = Joi.array().unique('studentNumber');

module.exports = {
  checkValidation(higherEducationRegistrationSet) {
    const { error } = validationSchema.validate(
      higherEducationRegistrationSet.registrations,
      validationConfiguration,
    );

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
};
