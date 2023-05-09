import { Serializer } from 'jsonapi-serializer';

const serialize = function (groups) {
  return new Serializer('groups', {
    id: 'name',
    attributes: ['name'],
  }).serialize(groups);
};

export { serialize };
