import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (tags) {
  return new Serializer('tags', {
    attributes: ['name'],
  }).serialize(tags);
};

export { serialize };
