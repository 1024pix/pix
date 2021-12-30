import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @tracked name = '';
  @tracked ownerName = '';
  @tracked status = null;

  @service currentUser;
  @service intl;

  get isArchived() {
    return this.status === 'archived';
  }

  get pageTitle() {
    let title = this.intl.t('pages.campaigns-list.title.active');
    if (this.model.query.filter.status === 'archived') {
      title = this.intl.t('pages.campaigns-list.title.archived');
    }
    return title;
  }

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => (this[filterKey] = filters[filterKey]));
    this.pageNumber = null;
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value;
    this.pageNumber = null;
  }

  @action
  updateCampaignStatus(newStatus) {
    this.status = newStatus;
  }

  @action
  goToCampaignPage(campaignId, event) {
    event.preventDefault();
    event.stopPropagation();
    this.transitionToRoute('authenticated.campaigns.campaign', campaignId);
  }
}
