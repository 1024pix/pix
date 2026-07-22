import { Serializer } from 'jsonapi-serializer';

const serialize = function (school) {
  return new Serializer('school', {
    pluralizeType: false,
    attributes: ['code', 'name', 'organizationLearners'],
  }).serialize(school);
};

export const schoolSerializer = { serialize };
