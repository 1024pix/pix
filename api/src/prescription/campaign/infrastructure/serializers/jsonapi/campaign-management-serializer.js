import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignManagement, meta) {
  return new Serializer('campaign', {
    attributes: [
      'archivedAt',
      'code',
      'createdAt',
      'creatorFirstName',
      'creatorFirstName',
      'creatorId',
      'creatorLastName',
      'customLandingPageText',
      'customResultPageButtonText',
      'customResultPageButtonUrl',
      'customResultPageText',
      'deletedAt',
      'externalIdLabel',
      'isForAbsoluteNovice',
      'isProfilesCollection',
      'isTypeAssessment',
      'multipleSendings',
      'name',
      'organizationId',
      'organizationName',
      'ownerFirstName',
      'ownerId',
      'ownerLastName',
      'sharedParticipationsCount',
      'targetProfileId',
      'targetProfileName',
      'title',
      'totalParticipationsCount',
      'type',
    ],
    meta,
  }).serialize(campaignManagement);
};

export const campaignManagementSerializer = { serialize };
