import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serializeForPaginatedList = function (userCampaignParticipationOverviewsPaginatedList) {
  const { campaignParticipationOverviews, pagination } = userCampaignParticipationOverviewsPaginatedList;
  return this.serialize(campaignParticipationOverviews, pagination);
};

const serialize = function (campaignParticipationOverview, meta) {
  return new Serializer('campaign-participation-overview', {
    attributes: [
      'isShared',
      'sharedAt',
      'createdAt',
      'organizationName',
      'status',
      'campaignCode',
      'campaignTitle',
      'disabledAt',
      'masteryRate',
      'validatedStagesCount',
      'totalStagesCount',
    ],
    meta,
  }).serialize(campaignParticipationOverview);
};

export { serialize, serializeForPaginatedList };
