import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  currentUser: service(),
  router: service(),
  store: service(),

  isInCampaignResults: computed(function() {
    return (this.get('router.currentRouteName') === 'campaigns.skill-review');
  }),

});
