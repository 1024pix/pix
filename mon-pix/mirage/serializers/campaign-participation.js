import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: ['assessment'],
  links(campaignParticipation) {
    return {
      'campaignParticipationResult': {
        related: `/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
      },
    };
  }
});
