import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

const serialize = function (payload) {
  return new Serializer('credits-lot', {
    attributes: ['structureId', 'count', 'activationDate', 'expirationDate', 'reference', 'creatorFullName', 'status'],
  }).serialize(payload);
};

const deserialize = function (payload) {
  return new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);
};

export const creditsLotSerializer = { deserialize, serialize };
