import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(organizationLearnerIdentity) {
    return new Serializer('organization-learner-identity', {
      attributes: ['lastName', 'firstName'],
    }).serialize(organizationLearnerIdentity);
  },
};
