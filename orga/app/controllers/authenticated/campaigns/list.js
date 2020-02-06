import { isEmpty } from '@ember/utils';
import { empty } from '@ember/object/computed';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'name'],
  pageNumber: 1,
  pageSize: 25,
  name: null,
  searchFilter: null,
  campaignName: null,

  hasNoCampaign: empty('model'),
  displayNoCampaignPanel: computed('name,hasNoCampaign', function() {
    return this.hasNoCampaign && isEmpty(this.name);
  }),

  setFieldName() {
    this.set(this.searchFilter.fieldName, this.searchFilter.value);
  },

  actions: {
    triggerFiltering(fieldName, value) {
      this.set('searchFilter', { fieldName, value });
      debounce(this, this.setFieldName, 500);
    },

    goToCampaignPage(campaignId) {
      this.transitionToRoute('authenticated.campaigns.details', campaignId);
    }
  }
});
