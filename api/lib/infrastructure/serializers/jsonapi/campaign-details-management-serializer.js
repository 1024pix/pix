const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(campaignManagement, meta) {
    return new Serializer('campaign', {
      attributes: [
        'name',
        'code',
        'type',
        'title',
        'createdAt',
        'archivedAt',
        'creatorId',
        'creatorLastName',
        'creatorFirstName',
        'organizationId',
        'organizationName',
        'targetProfileId',
        'targetProfileName',
        'customLandingPageText',
        'customResultPageText',
        'customResultPageButtonText',
        'customResultPageButtonUrl',
      ],
      meta,
    }).serialize(campaignManagement);
  },
};
