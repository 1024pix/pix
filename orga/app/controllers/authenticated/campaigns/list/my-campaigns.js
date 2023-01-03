import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

const DEFAULT_PAGE_NUMBER = 1;

export default class AuthenticatedCampaignsListMyCampaignsController extends Controller {
  @service router;
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 50;
  @tracked name = null;
  @tracked status = null;

  get isArchived() {
    return this.status === 'archived';
  }

  get isClearFiltersButtonDisabled() {
    return !this.name && !this.status;
  }

  @action
  clearFilters() {
    this.name = null;
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
    this.router.transitionTo('authenticated.campaigns.campaign', campaignId);
  }
}
