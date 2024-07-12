import { service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'pix-orga/config/environment';

const FRENCH_DOMAIN_EXTENSION = 'fr';
const FRENCH_LOCALE = 'fr-fr';
const FRENCHSPOKEN_LOCALE = 'fr';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service ajaxQueue;
  @service currentDomain;
  @service intl;
  @service session;

  host = ENV.APP.API_HOST;
  namespace = 'api';

  get headers() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    headers['Accept-Language'] = this._locale;
    headers['X-App-Version'] = ENV.APP.APP_VERSION;
    return headers;
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }

  get _locale() {
    const currentLocale = this.intl.primaryLocale;
    if (currentLocale === 'fr') {
      return this.currentDomain.getExtension() === FRENCH_DOMAIN_EXTENSION ? FRENCH_LOCALE : FRENCHSPOKEN_LOCALE;
    }
    return currentLocale;
  }
}
