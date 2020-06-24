import JSONAPIAdapter from '@ember-data/adapter/json-api';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';
import ENV from 'pix-orga/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';
const FRENCH_LOCALE = 'fr-fr';
const FRENCHSPOKEN_LOCALE = 'fr';

export default class ApplicationAdapter extends JSONAPIAdapter.extend(DataAdapterMixin) {
  @service currentDomain;
  @service ajaxQueue;
  host = ENV.APP.API_HOST;
  namespace = 'api';

  get headers() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    headers['Accept-Language'] = this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION ?
      FRENCH_LOCALE
      : FRENCHSPOKEN_LOCALE;

    return headers;
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }
}
