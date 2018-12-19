import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  session: service(),

  beforeModel() {
    const session = this.get('session');
    this.source = session.data.authenticated.source;
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
  },

  afterModel() {
    if(this.source === 'pix') {
      return this._redirectToHome();
    } else {
      return this._redirectToDisconnectedPage();
    }
  },

  _redirectToDisconnectedPage() {
    return this.transitionTo('disconnected');
  },

  _redirectToHome() {
    return window.location.replace(ENV.APP.HOME_HOST);
  },
  
});
