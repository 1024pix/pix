import { Serializer } from 'jsonapi-serializer';

const serialize = function (divisions) {
  return new Serializer('divisions', {
    id: 'name',
    attributes: ['name'],
  }).serialize(divisions);
};

export { serialize };
