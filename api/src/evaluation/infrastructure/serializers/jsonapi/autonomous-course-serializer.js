import jsonapiSerializer from 'jsonapi-serializer';
const { Serializer, Deserializer } = jsonapiSerializer;
const serializeId = function (autonomousCourseId) {
  return new Serializer('autonomous-course', {}).serialize({ id: autonomousCourseId });
};

const deserialize = function (payload) {
  return new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);
};

export { serializeId, deserialize };
