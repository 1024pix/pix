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
      'identityProvider',
      'targetProfileName',
      'targetProfileImageUrl',
      'customResultPageText',
      'customResultPageButtonText',
      'customResultPageButtonUrl',
      'multipleSendings',
      'isMobileCompliant',
      'isTabletCompliant',
    ],
  }).serialize(campaignsToJoin);
};

export { serialize };
