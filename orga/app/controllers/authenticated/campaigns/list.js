import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
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
  goToCampaignPage(campaignId, event) {
    event.preventDefault();
    event.stopPropagation();
    this.transitionToRoute('authenticated.campaigns.campaign', campaignId);
  }
}
