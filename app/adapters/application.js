import RESTAdapter from 'ember-data/adapters/rest';

export default RESTAdapter.extend({
  host: 'http://localhost:4200',
  namespace: 'api/live'
});
