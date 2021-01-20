const Joi = require('joi').extend(require('@joi/date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { allowUnknown: true };

const validationSchema = Joi.array().unique((a, b) => {
  return a.nationalStudentId === b.nationalStudentId &&
  a.nationalApprenticeId === b.nationalApprenticeId;
});

module.exports = {
  checkValidationUnicity(schoolingRegistrationSet) {
    const { error } = validationSchema.validate(
      schoolingRegistrationSet.registrations,
      validationConfiguration,
    );

    if (error) {
      const err = EntityValidationError.fromJoiErrors(error.details);
      err.key = 'nationalIdentifier';
      err.why = 'uniqueness';

      throw err;
    }
  },
};
