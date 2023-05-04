import { Serializer } from 'jsonapi-serializer';

const serialize = function (tags) {
  return new Serializer('tags', {
    attributes: ['name'],
  }).serialize(tags);
};

export { serialize };
