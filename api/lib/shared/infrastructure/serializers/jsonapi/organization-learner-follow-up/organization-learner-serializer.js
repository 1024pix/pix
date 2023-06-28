import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

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
