import { Serializer } from 'jsonapi-serializer';

export default {
  serializeForPaginatedList(userCampaignParticipationOverviewsPaginatedList) {
    const { campaignParticipationOverviews, pagination } = userCampaignParticipationOverviewsPaginatedList;
    return this.serialize(campaignParticipationOverviews, pagination);
  },

  serialize(campaignParticipationOverview, meta) {
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
  },
};
