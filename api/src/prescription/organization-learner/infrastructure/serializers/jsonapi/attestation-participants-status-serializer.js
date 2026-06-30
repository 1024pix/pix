import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ attestationParticipantsStatus, pagination }) {
  return new Serializer('attestation-participant-status', {
    id: 'id',
    attributes: ['lastName', 'firstName', 'obtainedAt', 'attestationKey', 'division', 'organizationLearnerId'],
    meta: pagination,
  }).serialize(attestationParticipantsStatus);
};

export const attestationParticipantsStatusSerializer = { serialize };
