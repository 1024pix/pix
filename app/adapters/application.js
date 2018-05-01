import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'pix-admin/config/environment';
import AdapterFetch from 'ember-fetch/mixins/adapter-fetch';
import { computed } from '@ember/object';

export default DS.JSONAPIAdapter.extend(AdapterFetch, DataAdapterMixin, {
  host: ENV.apiHost,

  headers: computed('session.data.authenticated', function() {
    if (this.get('session.isAuthenticated')) {
      let { access_token } = this.get('session.data.authenticated');
      return {
        'Authorization': `Bearer ${access_token}`
      };
    } else {
      return {};
    }
  }),

});
