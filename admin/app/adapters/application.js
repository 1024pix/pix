import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { inject as service } from '@ember/service';
import ENV from 'pix-admin/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service ajaxQueue;
  @service session;

  host = ENV.APP.API_HOST;
  namespace = 'api';

  get headers() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    return headers;
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }
}
