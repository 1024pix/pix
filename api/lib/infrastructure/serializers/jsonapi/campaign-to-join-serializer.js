const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(campaignsToJoin) {
    return new Serializer('campaign', {
      attributes: ['code', 'title', 'type', 'idPixLabel', 'customLandingPageText',
        'externalIdHelpImageUrl', 'alternativeTextToExternalIdHelpImage', 'isArchived',
        'isRestricted', 'organizationName', 'organizationType', 'organizationLogoUrl',
        'targetProfileName', 'targetProfileImageUrl'],
      organizationLogoUrl: {
        ref: 'id',
        ignoreRelationshipData: true,
        nullIfMissing: true,
        relationshipLinks: {
          related(record) {
            return `/api/organizations/${record.organizationId}/logo-url`;
          },
        },
      },
    }).serialize(campaignsToJoin);
  },
};
