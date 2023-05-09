import { Serializer } from 'jsonapi-serializer';

const serialize = function (campaignManagement, meta) {
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
};

export { serialize };
