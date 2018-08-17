import Component from '@ember/component';
import { inject } from '@ember/service';
import ENV from 'pix-orga/config/environment';
import { computed } from '@ember/object';

export default Component.extend({

  session: inject(),

  campaign: null,
  campaignCsv: computed('campaign', function() {
    return `${ENV.APP.API_HOST}/api/campaigns/${this.get('campaign.id')}/csvResults?userToken=${this.get('session.data.authenticated.access_token')}`
  }),

});
