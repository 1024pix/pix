import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (places) {
  return new Serializer('organization-places-lot', {
    attributes: ['organizationId', 'count', 'activationDate', 'expirationDate', 'status'],
  }).serialize(places);
};

export { serialize };
