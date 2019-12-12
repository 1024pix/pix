import { inject as service } from '@ember/service';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { isPresent } from '@ember/utils';
import ENV from 'mon-pix/config/environment';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  window: service(),
  notifications: service('notification-messages'),

  host: ENV.APP.API_HOST,
  namespace: 'api',

  authorize(xhr) {
    const { access_token } = this.get('session.data.authenticated');
    if (isPresent(access_token)) {
      xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);
    }
  },

  // If the API version is different from the last one
  // the front-end bundle might have changed too,
  // so we reload the window.
  handleResponse(statusCode, headers) {
    const apiVersion = headers[ENV.APP.apiVersionHeader];

    if (apiVersion) {
      const currentVersion = this.window.localStorage.getItem(ENV.APP.apiVersionHeader);

      this.window.localStorage.setItem(ENV.APP.apiVersionHeader, apiVersion);

      if (currentVersion && currentVersion !== apiVersion) {
        this.notifications.warning('Votre version de Pix n\'est plus à jour, cliquez ici pour recharger la page.', {
          autoClear: false,
          onClick: () => this.window.reload(),
        });
      }
    }

    return this._super(...arguments);
  },
});
