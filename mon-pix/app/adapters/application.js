import { service } from '@ember/service';
import { AdapterError } from '@warp-drive/legacy/adapter/error';
import { JSONAPIAdapter } from '@warp-drive/legacy/adapter/json-api';
import ENV from 'mon-pix/config/environment';

export default class Application extends JSONAPIAdapter {
  @service currentDomain;
  @service ajaxQueue;
  @service session;
  @service locale;
  @service router;

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

    if (status === 503) {
      const error = new AdapterError('Maintenance in progress');
      error.isAdapterError = true;
      error.code = 'MaintenanceError';
      error.errors = [{ title: 'Service Unavailable', detail: 'Down for maintenance.' }];
      return error;
    }

    return super.handleResponse(...arguments);
  }
}
