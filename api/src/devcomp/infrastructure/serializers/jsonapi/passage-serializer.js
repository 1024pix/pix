import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(passage) {
  return new Serializer('passage', {
    attributes: ['moduleId'],
  }).serialize(passage);
}

export { serialize };
