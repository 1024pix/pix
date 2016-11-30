import DS from 'ember-data';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend({

  namespace: 'api',
  host: config.APP.API_HOST

});
