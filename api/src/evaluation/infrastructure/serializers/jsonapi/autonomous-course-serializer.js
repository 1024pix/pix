import jsonapiSerializer from 'jsonapi-serializer';
const { Serializer, Deserializer } = jsonapiSerializer;
const serializeId = function (autonomousCourseId) {
  return new Serializer('autonomous-course', {}).serialize({ id: autonomousCourseId });
};

const serialize = function (autonomousCourse) {
  return new Serializer('autonomous-course', {
    attributes: ['internalTitle', 'publicTitle', 'customLandingPageText', 'createdAt', 'code'],
  }).serialize(autonomousCourse);
};

const deserialize = function (payload) {
  return new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);
};

export { serializeId, serialize, deserialize };
