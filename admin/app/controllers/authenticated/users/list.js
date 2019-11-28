import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize', 'firstName', 'lastName', 'email'],
  pageNumber: 1,
  pageSize: 10,
  firstName: null,
  lastName: null,
  email: null,

  actions: {
    triggerFiltering(fieldName, field) {
      this.set(fieldName, field);
    },
  }
});
