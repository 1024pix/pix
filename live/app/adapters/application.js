import Ember from 'ember';
import DS from 'ember-data';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend({

  namespace: 'api',
  host: config.APP.API_HOST,

  session: Ember.inject.service(),

  headers: Ember.computed('session.data.authenticated.token', function() {

    let tokenBearer = '';
    if (this.get('session.data.authenticated.token')) {
      tokenBearer = `Bearer ${this.get('session.data.authenticated.token')}`;
    }

    return {
      'Authorization': tokenBearer
    };
  })

});
