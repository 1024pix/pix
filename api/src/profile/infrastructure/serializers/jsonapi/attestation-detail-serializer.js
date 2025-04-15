import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (attestationDetail) {
  return new Serializer('attestation-detail', {
    attributes: ['obtainedAt', 'type'],
  }).serialize(attestationDetail);
};

export { serialize };
