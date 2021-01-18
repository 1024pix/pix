import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({

  links(campaign) {
    return {
      'campaignCollectiveResult': {
        related: `/api/campaigns/${campaign.id}/collective-results`,
      },
      'campaignAnalysis': {
        related: `/api/campaigns/${campaign.id}/analyses`,
      },
    };
  },
});
