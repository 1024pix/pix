const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const validationSchema = Joi.object({
  studentNumber: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthdate: Joi.date().required().format('YYYY-MM-DD'),
  email: Joi.string().email().optional()
});

module.exports = {
  checkValidation(higherEducationRegistration) {
    const { error } = validationSchema.validate(
      higherEducationRegistration,
      validationConfiguration,
    );
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
};
