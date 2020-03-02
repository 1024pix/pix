import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'pix-orga/config/environment';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  host: ENV.APP.API_HOST,
  namespace: 'api',

  session: service(),

  /*
  * Appelé uniquement lorsqu'on est connecté
  * ref: http://ember-simple-auth.com/api/classes/BaseAuthorizer.html#method_authorize
  */
  authorize(xhr) {
    const { access_token } = this.get('session.data.authenticated');
    xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  },

  headers: computed('session.data.authenticated.access_token', function() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    return headers;
  })
});
