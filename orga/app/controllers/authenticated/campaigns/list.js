import { action, computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from 'pix-orga/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'name', 'status', 'creatorId'];
  DEBOUNCE_MS = config.pagination.debounce;
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  pageSize = 25;
  name = null;
  @tracked creatorId = null;
  @tracked status = null;
  pendingFilters = {};

  @service currentUser;

  @computed('model')
  get displayNoCampaignPanel() {
    return !this.model.meta.hasCampaigns;
  }

  @equal('status', 'archived') isArchived;

  updateFilters() {
    this.setProperties(this.pendingFilters);
    this.pendingFilters = {};
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, event) {
    const value = event.target.value;
    this.pendingFilters[fieldName] = value;
    debounce(this, this.updateFilters, this.DEBOUNCE_MS);
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
