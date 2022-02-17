const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(campaignManagement, meta) {
    return new Serializer('campaign', {
      attributes: [
        'name',
        'code',
        'type',
        'title',
        'idPixLabel',
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
        'sharedParticipationsCount',
        'totalParticipationsCount',
        'isTypeProfilesCollection',
        'isTypeAssessment',
      ],
      meta,
    }).serialize(campaignManagement);
  },
};
