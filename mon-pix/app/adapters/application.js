import { service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'mon-pix/config/environment';

const FRANCE_TLD = 'fr';
const FRENCH_FRANCE_LOCALE = 'fr-fr';
const FRENCH_INTERNATIONAL_LOCALE = 'fr';

export default class Application extends JSONAPIAdapter {
  @service currentDomain;
  @service ajaxQueue;
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
    if (currentLocale === FRENCH_INTERNATIONAL_LOCALE) {
      return this.currentDomain.getExtension() === FRANCE_TLD ? FRENCH_FRANCE_LOCALE : FRENCH_INTERNATIONAL_LOCALE;
    }
    return currentLocale;
  }

  handleResponse(status) {
    if (status === 401 && this.session.isAuthenticated) {
      // no-await-on-purpose -- We want the session invalidation to happen in the background
      this.session.invalidate();
    }

    return super.handleResponse(...arguments);
  }
}
