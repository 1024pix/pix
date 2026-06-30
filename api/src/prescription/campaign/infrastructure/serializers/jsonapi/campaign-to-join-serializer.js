import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignsToJoin) {
  return new Serializer('campaign', {
    attributes: [
      'code',
      'title',
      'type',
      'externalIdLabel',
      'externalIdType',
      'customLandingPageText',
      'externalIdHelpImageUrl',
      'alternativeTextToExternalIdHelpImage',
      'isReconciliationRequired',
      'reconciliationFields',
      'isAccessible',
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
      'isMobileCompliant',
      'isTabletCompliant',
      'recommendationEngine',
    ],
  }).serialize(campaignsToJoin);
};

export const campaignToJoinSerializer = { serialize };
