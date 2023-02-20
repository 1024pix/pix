import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(participationsForCampaignManagement, meta) {
    return new Serializer('campaign-participation', {
      attributes: [
        'lastName',
        'firstName',
        'userId',
        'userFullName',
        'participantExternalId',
        'status',
        'createdAt',
        'sharedAt',
        'deletedAt',
        'deletedBy',
        'deletedByFullName',
      ],
      meta,
    }).serialize(participationsForCampaignManagement);
  },
};
