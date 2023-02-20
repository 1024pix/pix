import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(organizationLearner) {
    return new Serializer('organization-learner', {
      attributes: ['lastName', 'firstName', 'email', 'username', 'authenticationMethods', 'division', 'group'],
    }).serialize(organizationLearner);
  },
};
