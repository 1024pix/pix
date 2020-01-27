import { notEmpty } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'name'],
  pageNumber: 1,
  pageSize: 10,
  name: null,

  hasCampaign: notEmpty('model'),

  actions: {
    triggerFiltering(fieldName, value) {
      this.set(fieldName, value);
    },

    goToCampaignPage(campaignId) {
      this.transitionToRoute('authenticated.campaigns.details', campaignId);
    }
  }
});
