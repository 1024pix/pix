const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(campaignsToJoin) {
    return new Serializer('campaign', {
      attributes: ['code', 'title', 'type', 'idPixLabel', 'customLandingPageText',
        'externalIdHelpImageUrl', 'alternativeTextToExternalIdHelpImage', 'isArchived',
        'isRestricted', 'organizationName', 'organizationType', 'organizationLogoUrl',
        'targetProfileName', 'targetProfileImageUrl'],
    }).serialize(campaignsToJoin);
  },
};
