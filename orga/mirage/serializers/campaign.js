import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(campaign) {
    return {
      'campaignReport': {
        related: `/campaigns/${campaign.id}/campaign-report`
      },
    };
  }
});
