import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class LoginCnavRoute extends Route {
  @service session;
  @service router;
  @service location;

  get redirectUri() {
    const { protocol, host } = location;
    const path = this.router.urlFor(this.routeName);
    return `${protocol}//${host}${path}`;
  }

  beforeModel(transition) {
    const queryParams = transition.to ? transition.to.queryParams : transition.queryParams;
    if (!queryParams.code && queryParams.error) {
      return this.replaceWith('login');
    }

    if (!queryParams.code && !queryParams.error) {
      return this._handleRedirectRequest();
    }
  }

  async _handleRedirectRequest() {
    const response = await fetch(
      `${ENV.APP.API_HOST}/api/cnav/auth-url?redirect_uri=${encodeURIComponent(this.redirectUri)}`
    );

    const { redirectTarget, state, nonce } = await response.json();
    this.session.set('data.state', state);
    this.session.set('data.nonce', nonce);
    this.location.replace(redirectTarget);
  }
}
