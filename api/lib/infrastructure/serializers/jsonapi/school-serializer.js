import { Serializer } from 'jsonapi-serializer';

const serialize = function (school) {
  return new Serializer('school', {
    attributes: ['code', 'name'],
  }).serialize(school);
};

export { serialize };
