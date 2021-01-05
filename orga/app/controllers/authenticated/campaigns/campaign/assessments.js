import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import debounce from 'lodash/debounce';
import config from 'pix-orga/config/environment';

export default class AssessmentsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'divisions'];

  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked divisions = [];

  @action
  goToAssessmentPage(campaignId, participantId) {
    this.transitionToRoute('authenticated.campaigns.assessment', campaignId, participantId);
  }

  @action
  triggerFiltering(filters) {
    this.debouncedUpdateFilters(filters);
  }

  debouncedUpdateFilters = debounce(this._updateFilters, config.pagination.debounce);

  _updateFilters(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions;
  }
}
