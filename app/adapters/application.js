import RESTAdapter from 'ember-data/adapters/rest';
import ENV from 'pix-live/config/environment';

export default RESTAdapter.extend({
  host: ENV.APP.PIX_API_HOST,
  namespace: ENV.APP.PIX_API_NAMESPACE
});
