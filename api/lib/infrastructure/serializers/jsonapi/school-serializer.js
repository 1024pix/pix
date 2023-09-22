import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (school) {
  return new Serializer('school', {
    attributes: ['code', 'name'],
  }).serialize(school);
};

const serializer = { serialize };
export { serializer, serialize };
