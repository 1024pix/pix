import { Serializer } from 'jsonapi-serializer';

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
