import { Serializer } from 'jsonapi-serializer';

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
