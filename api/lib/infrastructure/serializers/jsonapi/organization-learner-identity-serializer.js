import { Serializer } from 'jsonapi-serializer';

const serialize = function (organizationLearnerIdentity) {
  return new Serializer('organization-learner-identity', {
    attributes: ['lastName', 'firstName'],
  }).serialize(organizationLearnerIdentity);
};

export { serialize };
