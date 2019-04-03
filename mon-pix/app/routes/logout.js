import { inject as service } from '@ember/service';
import BaseRoute from 'mon-pix/routes/base-route';
import { getHomeHost } from '../helpers/get-home-host';

export default BaseRoute.extend({

  session: service(),

  beforeModel() {
    const session = this.session;
    this.source = session.data.authenticated.source;
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
  },

  afterModel() {
    if (this.source === 'external') {
      return this._redirectToDisconnectedPage();
    } else {
      return this._redirectToHome();
    }
  },

  _redirectToDisconnectedPage() {
    return this.transitionTo('not-connected');
  },

  _redirectToHome() {
    return window.location.replace(getHomeHost());
  },
  
});
