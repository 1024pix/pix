import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(campaignManagement, meta) {
    return new Serializer('campaign', {
      attributes: [
        'name',
        'code',
        'type',
        'createdAt',
        'archivedAt',
        'creatorId',
        'creatorLastName',
        'creatorFirstName',
        'ownerId',
        'ownerLastName',
        'ownerFirstName',
      ],
      meta,
    }).serialize(campaignManagement);
  },
};
