import JSONAPIAdapter from '@ember-data/adapter/json-api';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';
import ENV from 'pix-orga/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter.extend(DataAdapterMixin) {
  @service ajaxQueue;
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
