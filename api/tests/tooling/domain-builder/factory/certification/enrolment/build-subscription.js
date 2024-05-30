import { Subscription } from '../../../../../../src/certification/enrolment/domain/models/Subscription.js';
import { SubscriptionTypes } from '../../../../../../src/certification/shared/domain/models/SubscriptionTypes.js';

const buildSubscription = function ({
  id = 123,
  type = SubscriptionTypes.CORE,
  complementaryCertificationId = null,
} = {}) {
  return new Subscription({
    id,
    type,
    complementaryCertificationId,
  });
};

export { buildSubscription };
