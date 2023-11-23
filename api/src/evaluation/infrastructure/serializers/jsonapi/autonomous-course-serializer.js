import jsonapiSerializer from 'jsonapi-serializer';
const { Serializer } = jsonapiSerializer;
const serializeId = function (autonomousCourseId) {
  return new Serializer('autonomous-course', {}).serialize({ id: autonomousCourseId });
};

export { serializeId };
