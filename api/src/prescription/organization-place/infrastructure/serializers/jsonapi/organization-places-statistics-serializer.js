import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (places) {
  return new Serializer('organization-place-statistics', {
    attributes: ['total', 'occupied', 'available'],
  }).serialize(places);
};

export { serialize };
