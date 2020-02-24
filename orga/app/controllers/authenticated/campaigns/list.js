import { isEmpty } from '@ember/utils';
import { empty } from '@ember/object/computed';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'name', 'status'],
  pageNumber: 1,
  pageSize: 25,
  name: null,
  searchFilter: null,
  campaignName: null,

  hasNoCampaign: empty('model'),
  displayNoCampaignPanel: computed('name,hasNoCampaign', function() {
    return this.hasNoCampaign && isEmpty(this.name) && isEmpty(this.status);
  }),
  isArchived: computed('status', function() {
    return this.status === 'archived';
  }),
  setFieldName() {
    this.set(this.searchFilter.fieldName, this.searchFilter.value);
  },

  actions: {
    triggerFiltering(fieldName, value) {
      this.set('searchFilter', { fieldName, value });
      debounce(this, this.setFieldName, 500);
    },
    updateCampaignStatus(newStatus) {
      this.set('status', newStatus);
    },
    goToCampaignPage(campaignId) {
      this.transitionToRoute('authenticated.campaigns.details', campaignId);
    }
  }
});
