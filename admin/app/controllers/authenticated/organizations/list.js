import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'name', 'type', 'code'],
  pageNumber: 1,
  pageSize: 10,
  name: null,
  type: null,
  code: null,

  actions: {
    triggerFiltering(fieldName, value) {
      this.set(fieldName, value);
    },

    goToOrganizationPage(organizationId) {
      this.transitionToRoute('authenticated.organizations.get', organizationId);
    }
  }
});
