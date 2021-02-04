// eslint-disable-next-line ember/no-mixins
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import ENV from 'pix-orga/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';
const FRENCH_LOCALE = 'fr-fr';
const FRENCHSPOKEN_LOCALE = 'fr';

export default class ApplicationAdapter extends JSONAPIAdapter.extend(DataAdapterMixin) {
  @service currentDomain;
  @service ajaxQueue;
  @service intl;

  host = ENV.APP.API_HOST;
  namespace = 'api';

  get headers() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    headers['Accept-Language'] = this._locale;
    return headers;
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }

  get _locale() {
    const currentLocale = this.intl.get('locale')[0];
    if (currentLocale === 'fr') {
      return this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION ?
        FRENCH_LOCALE
        : FRENCHSPOKEN_LOCALE;
    }
    return currentLocale;
  }
}
