const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(participationsForCampaignManagement, meta) {
    return new Serializer('campaign-participation', {
      attributes: [
        'lastName',
        'firstName',
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
