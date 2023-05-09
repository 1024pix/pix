import { Serializer } from 'jsonapi-serializer';

const serialize = function (organizationLearner) {
  return new Serializer('organization-learner', {
    attributes: [
      'lastName',
      'firstName',
      'email',
      'username',
      'authenticationMethods',
      'division',
      'group',
      'isCertifiable',
      'certifiableAt',
    ],
  }).serialize(organizationLearner);
};

export { serialize };
