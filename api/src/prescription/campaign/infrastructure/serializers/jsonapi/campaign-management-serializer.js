import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignManagement, meta) {
  return new Serializer('campaign', {
    attributes: [
      'name',
      'code',
      'type',
      'createdAt',
      'archivedAt',
      'deletedAt',
      'creatorId',
      'creatorLastName',
      'creatorFirstName',
      'ownerId',
      'ownerLastName',
      'ownerFirstName',
      'targetProfileId',
      'targetProfileName',
    ],
    meta,
  }).serialize(campaignManagement);
};

export { serialize };
