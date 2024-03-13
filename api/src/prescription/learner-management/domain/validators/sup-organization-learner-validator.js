import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);

import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';

const validationConfiguration = { allowUnknown: true, abortEarly: false };
const MAX_LENGTH = 255;

const validationSchema = Joi.object({
  studentNumber: Joi.string()
    .regex(/^[a-zA-Z0-9_\\-]*$/)
    .max(MAX_LENGTH)
    .required(),
  firstName: Joi.string().max(MAX_LENGTH).required(),
  middleName: Joi.string().max(MAX_LENGTH).optional(),
  thirdName: Joi.string().max(MAX_LENGTH).optional(),
  lastName: Joi.string().max(MAX_LENGTH).required(),
  preferredLastName: Joi.string().max(MAX_LENGTH).optional(),
  birthdate: Joi.date().required().format('YYYY-MM-DD').empty(null),
  email: Joi.string().email().optional(),
  diploma: Joi.string().max(MAX_LENGTH).optional(),
  department: Joi.string().max(MAX_LENGTH).optional(),
  educationalTeam: Joi.string().max(MAX_LENGTH).optional(),
  group: Joi.string().max(MAX_LENGTH).optional(),
  studyScheme: Joi.string().max(MAX_LENGTH).optional(),
  organizationId: Joi.number().integer().required(),
});

const validateSupOrganizationLearner = function (supOrganizationLearner) {
  const errors = [];
  const { error: validationErrors } = validationSchema.validate(supOrganizationLearner, validationConfiguration);

  if (!validationErrors) {
    return errors;
  }

  validationErrors.details.forEach((error) => {
    const err = EntityValidationError.fromJoiError(error);
    const { type, context } = error;

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
    if (context.key === 'studentNumber' && type === 'string.pattern.base') {
      err.why = 'student_number_format';
    }
    err.key = context.key;
    errors.push(err);
  });
  return errors;
};

export { validateSupOrganizationLearner };
