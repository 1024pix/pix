import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'mon-pix/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';
const FRENCH_LOCALE = 'fr-fr';
const FRENCHSPOKEN_LOCALE = 'fr';

export default JSONAPIAdapter.extend(DataAdapterMixin, {
  currentDomain: service(),
  host: ENV.APP.API_HOST,
  namespace: 'api',

  headers: computed('session.data.authenticated.access_token', function() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    headers['Accept-Language'] = this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION ?
      FRENCH_LOCALE
      : FRENCHSPOKEN_LOCALE;
    return headers;
  })
});
