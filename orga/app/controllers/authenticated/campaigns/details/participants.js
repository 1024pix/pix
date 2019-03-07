import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['pageNumber', 'pageSize'],
  pageNumber: 1,
  pageSize: 10,
});
