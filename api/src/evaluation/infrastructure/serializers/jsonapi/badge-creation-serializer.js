import jsonapiSerializer from 'jsonapi-serializer';

const { Deserializer } = jsonapiSerializer;

const deserializer = new Deserializer({
  keyForAttribute: 'camelCase',
});

export { deserializer };
