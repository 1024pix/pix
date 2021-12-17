const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(certificationCandidateSubscription) {
    return new Serializer('certification-candidate-subscription', {
      attributes: ['sessionId', 'eligibleSubscriptions', 'nonEligibleSubscriptions'],
    }).serialize(certificationCandidateSubscription);
  },
};
