import { Serializer } from 'jsonapi-serializer';

const serialize = function (campaignManagement, meta) {
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
      'multipleSendings',
    ],
    meta,
  }).serialize(campaignManagement);
};

export { serialize };
