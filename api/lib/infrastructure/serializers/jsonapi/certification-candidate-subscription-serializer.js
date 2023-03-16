import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationCandidateSubscription) {
  return new Serializer('certification-candidate-subscription', {
    attributes: ['sessionId', 'eligibleSubscriptions', 'nonEligibleSubscriptions'],
  }).serialize(certificationCandidateSubscription);
};

export { serialize };
