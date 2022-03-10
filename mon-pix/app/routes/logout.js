import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;
const AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI = ENV.APP.AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI;

export default class LogoutRoute extends Route {
  @service session;
  @service url;
  @service campaignStorage;

  beforeModel() {
    const session = this.session;
    this.source = session.data.authenticated.source;
    delete session.data.externalUser;
    this.campaignStorage.clearAll();

    if (session.isAuthenticated) {
      return session.invalidate();
    }
  }

  afterModel() {
    if (this.source === AUTHENTICATED_SOURCE_FROM_MEDIACENTRE) {
      return this._redirectToDisconnectedPage();
    } else if (this.source !== AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI) {
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
