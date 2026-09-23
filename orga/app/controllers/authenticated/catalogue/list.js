import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { EVENT_NAME } from '../../../constants/metrics-event-name';

export default class CatalogueListController extends Controller {
  queryParams = ['search', 'category', 'areas', 'competences', 'targetProfileId', 'blueprintId'];

  @tracked search = '';
  @tracked category = '';
  @tracked areas = [];
  @tracked competences = [];
  @tracked targetProfileId = null;
  @tracked blueprintId = null;
  @service pixMetrics;

  get isFiltered() {
    return this.search !== '' || this.category !== '' || this.areas.length > 0 || this.competences.length > 0;
  }

  @action
  updateFilter(fieldName, value) {
    if (fieldName === 'search' && value.trim()) {
      this.pixMetrics.trackEvent(EVENT_NAME.CATALOGUE.SEARCH, { catalogue_search: value });
    }
    this[fieldName] = value;
  }

  @action
  resetFilters() {
    this.search = '';
    this.category = '';
    this.areas = [];
    this.competences = [];
  }
}
