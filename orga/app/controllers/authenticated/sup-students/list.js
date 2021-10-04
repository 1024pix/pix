import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import debounce from 'lodash/debounce';

export default class ListController extends Controller {
  @tracked lastName = null;
  @tracked firstName = null;
  @tracked studentNumber = null;
  @tracked group = null;
  @tracked pageNumber = null;
  @tracked pageSize = null;

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => (this[filterKey] = filters[filterKey]));
    this.pageNumber = null;
  }

  debouncedUpdateFilters = debounce(this.updateFilters, ENV.pagination.debounce);

  @action
  triggerFiltering(fieldName, debounced, value) {
    if (debounced) {
      this.debouncedUpdateFilters({ [fieldName]: value });
    } else {
      this.updateFilters({ [fieldName]: value });
    }
  }
}
