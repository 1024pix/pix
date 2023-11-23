import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (places) {
  return new Serializer('organization-place', {
    attributes: ['count', 'activationDate', 'expirationDate', 'reference', 'category', 'status', 'creatorFullName'],
  }).serialize(places);
};

export { serialize };
