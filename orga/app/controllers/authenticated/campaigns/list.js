import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import debounce from 'lodash/debounce';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @tracked name = '';
  @tracked creatorName = '';
  @tracked status = null;

  get isArchived() {
    return this.status === 'archived';
  }

  get displayNoCampaignPanel() {
    return !this.model.meta.hasCampaigns;
  }

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => this[filterKey] = filters[filterKey]);
    this.pageNumber = null;
  }

  debouncedUpdateFilters = debounce(this.updateFilters, ENV.pagination.debounce);

  @action
  triggerFiltering(fieldName, debounced, event) {
    if (debounced) {
      this.debouncedUpdateFilters({ [fieldName]: event.target.value });
    } else {
      this.updateFilters({ [fieldName]: event.target.value });
    }
  }

  @action
  updateCampaignStatus(newStatus) {
    this.status = newStatus;
  }

  @action
  goToCampaignPage(campaignId) {
    this.transitionToRoute('authenticated.campaigns.campaign', campaignId);
  }
}
