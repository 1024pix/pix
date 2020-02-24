import JSONAPIAdapter from '@ember-data/adapter/json-api';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'pix-admin/config/environment';

export default JSONAPIAdapter.extend(DataAdapterMixin, {
  host: ENV.APP.API_HOST,
  namespace: 'api',

  authorize(xhr) {
    const { access_token } = this.get('session.data.authenticated');
    xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
  },

});
