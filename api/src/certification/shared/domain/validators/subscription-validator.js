import Joi from 'joi';

import { SUBSCRIPTION_TYPES } from '../constants.js';

const subscriptionSchema = Joi.object({
  certificationCandidateId: Joi.number().optional().allow(null),
  type: Joi.string().required().valid(SUBSCRIPTION_TYPES.CORE, SUBSCRIPTION_TYPES.COMPLEMENTARY),
  complementaryCertificationId: Joi.when('type', {
    is: SUBSCRIPTION_TYPES.COMPLEMENTARY,
    then: Joi.number().required(),
    otherwise: Joi.any().valid(null).allow(null),
  }),
});

function validate(subscription) {
  const { error } = subscriptionSchema.validate(subscription);
  if (error) {
    throw new TypeError(error);
  }
}

export { subscriptionSchema, validate };
