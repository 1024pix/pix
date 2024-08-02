import { service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
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
    headers['Accept-Language'] = this.intl.primaryLocale;
    headers['X-App-Version'] = ENV.APP.APP_VERSION;

    return headers;
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }
}
