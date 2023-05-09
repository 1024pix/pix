import { Serializer } from 'jsonapi-serializer';

const serialize = function (participationsForCampaignManagement, meta) {
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
};

export { serialize };
