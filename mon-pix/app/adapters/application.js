import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import DS from 'ember-data';
import config from '../config/environment';

export default DS.JSONAPIAdapter.extend({

  host: config.APP.API_HOST,
  namespace: 'api',

  session: service(),

  headers: computed('session.data.authenticated.token', function() {

    let tokenBearer = '';
    if (this.get('session.data.authenticated.token')) {
      tokenBearer = `Bearer ${this.get('session.data.authenticated.token')}`;
    }

    return {
      'Authorization': tokenBearer
    };
  })

});
