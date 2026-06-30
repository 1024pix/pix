import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (filters) {
  return new Serializer('organization-learner-filters', {
    id: 'attributeName',
    attributes: ['attributeName', 'values'],
  }).serialize(filters);
};

export const organizationLearnerFilterSerializer = { serialize };
