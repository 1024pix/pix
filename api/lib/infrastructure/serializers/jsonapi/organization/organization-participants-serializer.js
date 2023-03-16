import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ organizationParticipants, meta }) {
  return new Serializer('organization-participants', {
    id: 'id',
    attributes: [
      'firstName',
      'lastName',
      'participationCount',
      'lastParticipationDate',
      'campaignName',
      'campaignType',
      'participationStatus',
      'isCertifiable',
      'certifiableAt',
    ],
    meta,
  }).serialize(organizationParticipants);
};

export { serialize };
