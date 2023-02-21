import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { EntityValidationError } from '../errors';

const validationConfiguration = { allowUnknown: true };

const validationSchema = Joi.array().unique('studentNumber');

export default {
  checkValidation(organizationLearnerSet) {
    const { error } = validationSchema.validate(organizationLearnerSet.learners, validationConfiguration);

    if (error) {
      const err = EntityValidationError.fromJoiErrors(error.details);
      err.key = 'studentNumber';
      err.why = 'uniqueness';
      throw err;
    }
  },
};
