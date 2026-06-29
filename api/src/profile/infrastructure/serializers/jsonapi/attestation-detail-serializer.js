import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (attestationDetail) {
  return new Serializer('attestation-detail', {
    attributes: ['obtainedAt', 'label', 'key'],
  }).serialize(attestationDetail);
};

export const attestationDetailSerializer = { serialize };
