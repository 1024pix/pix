const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { abortEarly: false, allowUnknown: true };

const validationSchema = Joi.object({
  studentNumber: Joi.string()
    .when('$isSupernumerary', {
      switch: [{
        is: true,
        then: Joi.optional().allow(null),
      }, {
        is: false,
        then: Joi.required(),
      }]
    }),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthdate: Joi.date().required().format('YYYY-MM-DD'),
  email: Joi.string().email().optional(),
  organizationId: Joi.number().integer().required(),
  isSupernumerary: Joi.boolean().required()
});

module.exports = {
  checkValidation(higherEducationRegistration) {
    const { error } = validationSchema.validate(
      higherEducationRegistration,
      { ...validationConfiguration, context: { isSupernumerary: higherEducationRegistration.isSupernumerary } }
    );
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
};
