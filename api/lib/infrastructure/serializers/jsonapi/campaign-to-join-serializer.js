const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(campaignsToJoin) {
    return new Serializer('campaign', {
      attributes: [
        'code',
        'title',
        'type',
        'idPixLabel',
        'customLandingPageText',
        'externalIdHelpImageUrl',
        'alternativeTextToExternalIdHelpImage',
        'isArchived',
        'isForAbsoluteNovice',
        'isRestricted',
        'isSimplifiedAccess',
        'organizationName',
        'organizationType',
        'organizationLogoUrl',
        'organizationIsPoleEmploi',
        'organizationShowNPS',
        'targetProfileName',
        'targetProfileImageUrl',
        'customResultPageText',
        'customResultPageButtonText',
        'customResultPageButtonUrl',
        'multipleSendings',
      ],
    }).serialize(campaignsToJoin);
  },
};
