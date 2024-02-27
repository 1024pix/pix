import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'id', 'name', 'type', 'externalId'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked name = null;
  @tracked type = null;
  @tracked externalId = null;

  updateFilters(filters) {
    for (const filterKey of Object.keys(filters)) {
      this[filterKey] = filters[filterKey];
    }
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, event) {
    debounceTask(this, 'updateFilters', { [fieldName]: event.target.value }, this.DEBOUNCE_MS);
  }
}
