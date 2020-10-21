import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

import get from 'lodash/get';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

@classic
export default class LogoutRoute extends Route {
  @service session;
  @service url;

  beforeModel() {
    const session = this.session;
    this.source = session.data.authenticated.source;
    delete session.data.externalUser;
    if (session.get('isAuthenticated')) {
      if (get(session, 'data.authenticated.id_token')) {
        const { id_token } = session.data.authenticated;
        session.singleLogout(id_token);
      }

      return session.invalidate();
    }
  }

  afterModel() {
    if (this.source === AUTHENTICATED_SOURCE_FROM_MEDIACENTRE) {
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
