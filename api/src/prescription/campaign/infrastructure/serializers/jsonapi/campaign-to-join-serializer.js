import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignsToJoin) {
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
      'organizationId',
      'organizationName',
      'organizationType',
      'organizationLogoUrl',
      'identityProvider',
      'organizationShowNPS',
      'organizationFormNPSUrl',
      'targetProfileName',
      'targetProfileImageUrl',
      'customResultPageText',
      'customResultPageButtonText',
      'customResultPageButtonUrl',
      'multipleSendings',
      'isFlash',
    ],
  }).serialize(campaignsToJoin);
};

export { serialize };
