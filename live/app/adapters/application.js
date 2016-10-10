import RESTAdapter from 'ember-data/adapters/rest';

export default RESTAdapter.extend({
  host: EmberENV.apiHost.current
});
