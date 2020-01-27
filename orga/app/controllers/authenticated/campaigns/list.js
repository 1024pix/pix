import { isEmpty } from '@ember/utils';
import { empty } from '@ember/object/computed';
import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'name'],
  pageNumber: 1,
  pageSize: 10,
  name: null,

  hasNoCampaign: empty('model'),
  displayNoCampaignPanel: computed('name,hasNoCampaign', function() {
    return this.hasNoCampaign && isEmpty(this.name);
  }),

  actions: {
    triggerFiltering(fieldName, value) {
      this.set(fieldName, value);
    },

    goToCampaignPage(campaignId) {
      this.transitionToRoute('authenticated.campaigns.details', campaignId);
    }
  }
});
