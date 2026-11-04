import { service } from '@ember/service';
import { JSONAPIAdapter } from '@warp-drive/legacy/adapter/json-api';
import ENV from 'mon-pix/config/environment';

export default class Application extends JSONAPIAdapter {
  @service currentDomain;
  @service ajaxQueue;
  @service session;
  @service locale;

  host = ENV.APP.API_HOST;
  namespace = 'api';

  get headers() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }
    headers['X-App-Version'] = ENV.APP.APP_VERSION;
    return headers;
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }

  handleResponse(status) {
    if (status === 401 && this.session.isAuthenticated) {
      // no-await-on-purpose -- We want the session invalidation to happen in the background
      this.session.invalidate();
    }

    return super.handleResponse(...arguments);
  }
}
