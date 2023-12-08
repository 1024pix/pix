import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (places) {
  return new Serializer('organization-places-capacity', {
    attributes: ['categories'],
  }).serialize(places);
};

export { serialize };
