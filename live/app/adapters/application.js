import Ember from 'ember';
import DS from 'ember-data';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend({

  namespace: 'api',
  host: config.APP.API_HOST,

  authentication: Ember.inject.service(),

  headers: Ember.computed('authentication.token', function() {
    let tokenBearer;
    if(this.get('authentication.token')) {
      tokenBearer = `bearer ${this.get('authentication.token')}`;
    } else {
      tokenBearer = '';
    }

    return {
      'www-authentication': tokenBearer
    };
  })

});
