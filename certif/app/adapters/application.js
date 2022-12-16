import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service ajaxQueue;
  @service session;
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
    const [currentLocale] = this.intl.get('locale');
    return currentLocale;
  }
}
