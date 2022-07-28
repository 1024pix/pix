import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;

export default class AuthenticatedCampaignsListAllCampaignsController extends Controller {
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @tracked name = null;
  @tracked ownerName = null;
  @tracked status = null;

  get isArchived() {
    return this.status === 'archived';
  }

  get isClearFiltersButtonDisabled() {
    return !this.name && !this.ownerName && !this.status;
  }

  @action
  clearFilters() {
    this.name = null;
    this.ownerName = null;
    this.status = null;
    this.pageNumber = null;
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  goToCampaignPage(campaignId, event) {
    event.preventDefault();
    event.stopPropagation();
    this.transitionToRoute('authenticated.campaigns.campaign', campaignId);
  }
}
