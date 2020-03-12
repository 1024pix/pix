import { action, computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'name', 'status', 'creatorId'];
  pageNumber = 1;
  pageSize = 25;
  name = null;
  searchFilter = null;
  campaignName = null;

  @service currentUser;

  @empty('model') hasNoCampaign;

  @computed('name', 'hasNoCampaign')
  get displayNoCampaignPanel() {
    return this.hasNoCampaign && isEmpty(this.name) && isEmpty(this.status) && isEmpty(this.creatorId);
  }

  @computed('status')
  get isArchived() {
    return this.status === 'archived';
  }

  setFieldName() {
    this.set(this.searchFilter.fieldName, this.searchFilter.value);
  }

  @action
  triggerFiltering(fieldName, value) {
    this.set('searchFilter', { fieldName, value });
    debounce(this, this.setFieldName, 500);
  }

  @action
  updateCampaignStatus(newStatus) {
    this.set('status', newStatus);
  }

  @action
  updateCampaignCreator(creatorId) {
    this.set('creatorId', creatorId);
  }

  @action
  goToCampaignPage(campaignId) {
    this.transitionToRoute('authenticated.campaigns.details', campaignId);
  }
}
