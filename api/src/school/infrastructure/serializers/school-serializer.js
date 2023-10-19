import { Serializer } from 'jsonapi-serializer';

const serialize = function (school) {
  return new Serializer('school', {
    attributes: ['code', 'name', 'organizationLearners'],
  }).serialize(school);
};

export { serialize };
