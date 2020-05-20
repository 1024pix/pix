import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';

import Route from '@ember/routing/route';

@classic
export default class LogoutRoute extends Route {
  @service session;
  @service url;

  beforeModel() {
    const session = this.session;
    this.source = session.data.authenticated.source;
    if (session.get('isAuthenticated')) {
      return session.invalidate();
    }
  }

  afterModel() {
    if (this.source === 'external') {
      return this._redirectToDisconnectedPage();
    } else {
      return this._redirectToHome();
    }
  }

  _redirectToDisconnectedPage() {
    return this.transitionTo('not-connected');
  }

  _redirectToHome() {
    return window.location.replace(this.url.homeUrl);
  }
}
