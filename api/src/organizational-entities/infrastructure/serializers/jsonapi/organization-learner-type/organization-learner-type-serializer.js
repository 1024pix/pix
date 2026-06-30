import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (organizationLearnerType) {
  return new Serializer('organization-learner-types', {
    attributes: ['name'],
  }).serialize(organizationLearnerType);
};

export const organizationLearnerTypeSerializer = { serialize };
