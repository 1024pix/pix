import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (filters) {
  const filtersWithId = filters.map((filter) => ({
    ...filter,
    id: `${filter.organizationId}-${filter.attributeName}`,
  }));
  return new Serializer('organization-learner-filters', {
    attributes: ['attributeName', 'values'],
  }).serialize(filtersWithId);
};

export const organizationLearnerFilterSerializer = { serialize };
