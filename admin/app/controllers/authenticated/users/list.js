import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import debounce from 'lodash/debounce';
import config from 'pix-admin/config/environment';
import { action } from '@ember/object';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'firstName', 'lastName', 'email'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;

  @tracked firstNameForm = null;
  @tracked lastNameForm = null;
  @tracked emailForm = null;

  pendingFilters = {};

  debouncedUpdateFilters = debounce(this.updateFilters, this.DEBOUNCE_MS);

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => (this[filterKey] = filters[filterKey]));
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  async refreshModel(event) {
    await this.debouncedUpdateFilters({
      firstName: this.firstNameForm,
      lastName: this.lastNameForm,
      email: this.emailForm,
    });

    event.preventDefault();
  }
}
