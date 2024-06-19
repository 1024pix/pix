import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizationLearnerIdentity) {
  return new Serializer('organization-learner-identity', {
    attributes: ['lastName', 'firstName'],
  }).serialize(organizationLearnerIdentity);
};

export { serialize };
