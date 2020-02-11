import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';

const DEFAULT_PAGE_NUMBER = 1;

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'name', 'type', 'code'],
  pageNumber: DEFAULT_PAGE_NUMBER,
  pageSize: 10,
  name: null,
  type: null,
  code: null,

  searchFilter: null,

  setFieldName() {
    this.set(this.searchFilter.fieldName, this.searchFilter.value);
    this.set('pageNumber', DEFAULT_PAGE_NUMBER);
  },

  actions: {
    triggerFiltering(fieldName, value) {
      this.set('searchFilter', { fieldName, value });
      debounce(this, this.setFieldName, 500);
    },

    goToOrganizationPage(organizationId) {
      this.transitionToRoute('authenticated.organizations.get', organizationId);
    }
  }
});
