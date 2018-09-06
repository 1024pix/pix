import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  session: service(),

  beforeModel() {
    const session = this.get('session');
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
    this._redirectToHome();
  },

  _redirectToHome() {
    window.location.replace(ENV.APP.HOME_HOST);
  },
});
