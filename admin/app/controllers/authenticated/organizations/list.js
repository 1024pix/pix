import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import debounce from 'lodash/debounce';
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
    Object.keys(filters).forEach((filterKey) => this[filterKey] = filters[filterKey]);
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  debouncedUpdateFilters = debounce(this.updateFilters, this.DEBOUNCE_MS);

  @action
  triggerFiltering(fieldName, event) {
    this.debouncedUpdateFilters({ [fieldName]: event.target.value });
  }

  @action
  goToOrganizationPage(organizationId) {
    this.transitionToRoute('authenticated.organizations.get', organizationId);
  }
}
