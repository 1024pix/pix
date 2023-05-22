import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (divisions) {
  return new Serializer('divisions', {
    id: 'name',
    attributes: ['name'],
  }).serialize(divisions);
};

export { serialize };
