import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({

  links(campaignParticipation) {
    return {
      'campaignAnalysis': {
        related: `/api/campaign-participations/${campaignParticipation.id}/analyses`,
      },
      'campaignParticipationResult': {
        related: `/api/campaign-participations/${campaignParticipation.id}/campaign-participation-result`,
      },
    };
  },
});
