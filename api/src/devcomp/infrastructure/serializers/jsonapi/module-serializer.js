import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    attributes: ['title'],
  }).serialize(module);
}

export { serialize };
