import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(campaign) {
    return {
      campaignCollectiveResult: {
        related: `/api/campaigns/${campaign.id}/collective-results`,
      },
      campaignAnalysis: {
        related: `/api/campaigns/${campaign.id}/analyses`,
      },
    };
  },
});
