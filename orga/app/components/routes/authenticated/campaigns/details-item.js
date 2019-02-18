import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),

  selectedNavbarItem: 'parameters',

  participationsCount: computed('campaign.campaignReport.participationsCount', function() {
    const participationsCount = this.get('campaign.campaignReport.participationsCount');

    return participationsCount > 0 ? participationsCount : '-';
  }),

  sharedParticipationsCount: computed('campaign.campaignReport.sharedParticipationsCount', function() {
    const sharedParticipationsCount = this.get('campaign.campaignReport.sharedParticipationsCount');

    return sharedParticipationsCount > 0 ? sharedParticipationsCount : '-';
  }),

  init({ navbarItem }) {
    this._super(...arguments);
    this.selectedNavbarItem = navbarItem;
  },

  actions: {
    selectNavbarItem(item) {
      this.set('selectedNavbarItem', item);
      const route = 'authenticated.campaigns.details.'.concat(item);
      return this.get('router').transitionTo(route);
    }
  }
});
