import { action } from '@ember/object';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {

  queryParams = ['pageNumber', 'pageSize', 'name', 'type', 'externalId'];

  pageNumber = DEFAULT_PAGE_NUMBER;
  pageSize = 10;
  name = null;
  type = null;
  externalId = null;

  searchFilter = null;

  setFieldName() {
    this.searchFilter.fieldName = this.searchFilter.value;
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, value) {
    this.searchFilter = { fieldName, value };
    debounce(this, this.setFieldName, 500);
  }

  @action
  goToOrganizationPage(organizationId) {
    this.transitionToRoute('authenticated.organizations.get', organizationId);
  }
}
