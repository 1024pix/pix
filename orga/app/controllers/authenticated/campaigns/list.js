import { sort, notEmpty } from '@ember/object/computed';
import Controller from '@ember/controller';

const SORTING_ORDER = ['name:asc', 'createdAt:desc'];

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'name'],
  pageNumber: 1,
  pageSize: 10,
  name: null,

  sortingOrder: SORTING_ORDER,
  sortedCampaigns: sort('model', 'sortingOrder'),
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
