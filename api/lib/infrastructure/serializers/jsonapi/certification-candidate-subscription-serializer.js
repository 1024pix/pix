import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(certificationCandidateSubscription) {
    return new Serializer('certification-candidate-subscription', {
      attributes: ['sessionId', 'eligibleSubscriptions', 'nonEligibleSubscriptions'],
    }).serialize(certificationCandidateSubscription);
  },
};
