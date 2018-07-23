import { inject as service } from '@ember/service';
import _ from 'lodash';

import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({
  session: service(),
  splash: service(),

  activate() {
    this.get('splash').hide();
  },

  hasUnauthorizedError(errorEvent) {
    const statusCode = _.get(errorEvent, 'errors[0].code');
    return statusCode === 401;
  },

  actions: {
    error: function(error) {
      if (this.hasUnauthorizedError(error)) {
        return this.get('session').invalidate()
          .then(() => this.transitionTo('login'));
      }
    }
  }
});
