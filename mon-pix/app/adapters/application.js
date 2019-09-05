import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { isPresent } from '@ember/utils';
import ENV from 'mon-pix/config/environment';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  host: ENV.APP.API_HOST,
  namespace: 'api',

  authorize(xhr) {
    const { access_token } = this.get('session.data.authenticated');
    if (isPresent(access_token)) {
      xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
    }
  }
});
