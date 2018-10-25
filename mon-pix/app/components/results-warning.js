import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['results-warning'],
  campaignParticipations: [],

  hasCampaignParticipations: computed('campaignParticipations', function() {
    return this.get('campaignParticipations').toArray().length;
  }),

});
