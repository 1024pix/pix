import Joi from 'joi';

import { SUBSCRIPTION_TYPES } from '../constants.js';
import { ComplementaryCertificationKeys } from '../models/ComplementaryCertificationKeys.js';

const subscriptionSchema = Joi.object({
  certificationCandidateId: Joi.number().optional().allow(null),
  type: Joi.string().required().valid(SUBSCRIPTION_TYPES.CORE, SUBSCRIPTION_TYPES.COMPLEMENTARY),
  complementaryCertificationKey: Joi.when('type', {
    is: SUBSCRIPTION_TYPES.COMPLEMENTARY,
    then: Joi.string()
      .valid(...Object.values(ComplementaryCertificationKeys))
      .required(),
    otherwise: Joi.any().valid(null).allow(null),
  }),
});

export function validate(subscription) {
  const { error } = subscriptionSchema.validate(subscription);
  if (error) {
    throw new TypeError(error);
  }
}
