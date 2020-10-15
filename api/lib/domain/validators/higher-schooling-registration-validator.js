const Joi = require('@hapi/joi').extend(require('@hapi/joi-date'));
const { EntityValidationError } = require('../errors');

const validationConfiguration = { allowUnknown: true };
const MAX_LENGTH = 255;

const validationSchema = Joi.object({
  studentNumber: Joi.string().regex(/^[a-zA-Z0-9_\\-]*$/).max(MAX_LENGTH)
    .when('$isSupernumerary', {
      switch: [{
        is: true,
        then: Joi.optional().allow(null),
      }, {
        is: false,
        then: Joi.required(),
      }],
    }),
  firstName: Joi.string().max(MAX_LENGTH).required(),
  middleName: Joi.string().max(MAX_LENGTH).optional(),
  thirdName: Joi.string().max(MAX_LENGTH).optional(),
  lastName: Joi.string().max(MAX_LENGTH).required(),
  preferredLastName: Joi.string().max(MAX_LENGTH).optional(),
  birthdate: Joi.date().required().format('YYYY-MM-DD').empty(null),
  email: Joi.string().max(MAX_LENGTH).email().optional(),
  diploma: Joi.string().max(MAX_LENGTH).optional(),
  department: Joi.string().max(MAX_LENGTH).optional(),
  educationalTeam: Joi.string().max(MAX_LENGTH).optional(),
  group: Joi.string().max(MAX_LENGTH).optional(),
  studyScheme: Joi.string().max(MAX_LENGTH).optional(),
  organizationId: Joi.number().integer().required(),
  isSupernumerary: Joi.boolean().required(),
});

module.exports = {
  checkValidation(higherSchoolingRegistration) {
    const { error } = validationSchema.validate(
      higherSchoolingRegistration,
      { ...validationConfiguration, context: { isSupernumerary: higherSchoolingRegistration.isSupernumerary } },
    );
    if (error) {
      const err = EntityValidationError.fromJoiErrors(error.details);
      err.key = error.details[0].context.key;
      const { type, context } = error.details[0];
      if (type === 'any.required') {
        err.why = 'required';
      }
      if (type === 'string.max') {
        err.why = 'max_length';
        err.limit = context.limit;
      }
      if (type === 'date.format') {
        err.why = 'date_format';
      }
      if (type === 'string.email') {
        err.why = 'email_format';
      }
      if (type === 'string.base') {
        err.why = 'not_a_string';
      }
      if (type === 'number.base' || type === 'number.integer') {
        err.why = 'not_an_integer';
      }
      if (type === 'boolean.base') {
        err.why = 'not_a_boolean';
      }
      if (err.key === 'studentNumber' && type === 'string.pattern.base') {
        err.why = 'student_number_format';
      }
      throw err;
    }
  },
};
