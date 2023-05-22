import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ scoOrganizationParticipants, meta }) {
  return new Serializer('sco-organization-participants', {
    id: 'id',
    attributes: [
      'lastName',
      'firstName',
      'birthdate',
      'username',
      'userId',
      'email',
      'isAuthenticatedFromGAR',
      'division',
      'participationCount',
      'lastParticipationDate',
      'campaignName',
      'campaignType',
      'participationStatus',
      'isCertifiable',
      'certifiableAt',
    ],
    meta,
  }).serialize(scoOrganizationParticipants);
};

export { serialize };
