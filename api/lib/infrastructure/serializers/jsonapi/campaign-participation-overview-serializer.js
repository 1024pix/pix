const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serializeForPaginatedList(userCampaignParticipationOverviewsPaginatedList) {
    const { campaignParticipationOverviews, pagination } = userCampaignParticipationOverviewsPaginatedList;
    return this.serialize(campaignParticipationOverviews, pagination);
  },

  serialize(campaignParticipationOverview, meta) {
    return new Serializer('campaign-participation-overview',
      {
        attributes: ['isShared', 'sharedAt', 'createdAt', 'organizationName', 'assessmentState', 'campaignCode', 'campaignTitle', 'masteryPercentage'],
        meta,
      }).serialize(campaignParticipationOverview);
  },
};
