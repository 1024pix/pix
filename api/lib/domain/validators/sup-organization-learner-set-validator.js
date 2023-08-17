import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { EntityValidationError } from '../errors.js';

const validationConfiguration = { allowUnknown: true };

const validationSchema = Joi.array().unique('studentNumber');

const checkValidation = function (organizationLearnerSet) {
  const { error } = validationSchema.validate(organizationLearnerSet.learners, validationConfiguration);

  if (error) {
    const err = EntityValidationError.fromJoiErrors(error.details);
    err.key = 'studentNumber';
    err.why = 'uniqueness';
    throw err;
  }
};

export { checkValidation };
