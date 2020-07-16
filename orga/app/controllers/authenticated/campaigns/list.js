import { action, computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import get from 'lodash/get';
import debounce from 'lodash/debounce';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @tracked name = '';
  @tracked creatorId = '';
  @tracked status = null;

  @service currentUser;

  @equal('status', 'archived') isArchived;

  @computed('model')
  get displayNoCampaignPanel() {
    return !this.model.meta.hasCampaigns;
  }

  @computed('currentUser.organization.memberships')
  get membersOptions() {
    const members = get(this.currentUser,'organization.memberships', []);
    return members.map(({ user }) => ({
      value: user.get('id'),
      label: `${user.get('firstName')} ${user.get('lastName')}`,
    }));
  }

  updateFilters(filters) {
    this.setProperties(filters);
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
    this.transitionToRoute('authenticated.campaigns.details', campaignId);
  }
}
