const Joi = require('joi').extend(require('@joi/date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { allowUnknown: true };

const validationSchema = Joi.array().unique('studentNumber');

module.exports = {
  checkValidation(higherSchoolingRegistrationSet) {
    const { error } = validationSchema.validate(
      higherSchoolingRegistrationSet.registrations,
      validationConfiguration,
    );

    if (error) {
      const err = EntityValidationError.fromJoiErrors(error.details);
      err.key = 'studentNumber';
      err.why = 'uniqueness';
      throw err;
    }
  },
};
