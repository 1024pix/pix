import { action, computed } from '@ember/object';
import { empty } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from 'pix-orga/config/environment';

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'name', 'status', 'creatorId'];
  DEBOUNCE_MS = config.pagination.debounce;
  pageNumber = 1;
  pageSize = 25;
  name = null;
  @tracked creatorId = null;
  @tracked status = null;
  searchFilter = null;

  @service currentUser;

  @empty('model') hasNoCampaign;

  @computed('model')
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
  triggerFiltering(fieldName, event) {
    const value = event.target.value;
    this.searchFilter = { fieldName, value };
    debounce(this, this.setFieldName, this.DEBOUNCE_MS);
  }

  @action
  updateCampaignStatus(newStatus) {
    this.status = newStatus;
  }

  @action
  updateCampaignCreator(creatorId) {
    this.creatorId = creatorId;
  }

  @action
  goToCampaignPage(campaignId) {
    this.transitionToRoute('authenticated.campaigns.details', campaignId);
  }
}
