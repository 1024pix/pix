import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(campaignParticipation) {
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
  },
};
