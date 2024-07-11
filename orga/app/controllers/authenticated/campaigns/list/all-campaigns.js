import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;

export default class AuthenticatedCampaignsListAllCampaignsController extends Controller {
  @service router;
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 50;
  @tracked name = null;
  @tracked ownerName = null;
  @tracked status = null;

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
    this.router.transitionTo('authenticated.campaigns.campaign', campaignId);
  }

  @action
  onDeleteCampaigns() {
    this.send('refreshModel');
  }
}
