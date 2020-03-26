import { computed } from '@ember/object';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'pix-certif/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter.extend(DataAdapterMixin) {
  host = ENV.APP.API_HOST;
  namespace = 'api';

  @computed('session.data.authenticated.access_token')
  get headers() {
    const headers = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
    }

    return headers;
  }
}
