import Joi from 'joi';

import { SubscriptionTypes } from '../models/SubscriptionTypes.js';

const subscriptionSchema = Joi.object({
  certificationCandidateId: Joi.number().optional(),
  type: Joi.string().required().valid(SubscriptionTypes.CORE, SubscriptionTypes.COMPLEMENTARY),
  complementaryCertificationId: Joi.when('type', {
    is: SubscriptionTypes.COMPLEMENTARY,
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
