import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignParticipation) {
  return new Serializer('user-participation', {
    attributes: [
      'participantExternalId',
      'status',
      'campaignId',
      'campaignCode',
      'createdAt',
      'sharedAt',
      'deletedAt',
      'deletedBy',
      'deletedByFullName',
      'organizationLearnerFullName',
    ],
  }).serialize(campaignParticipation);
};

export { serialize };
