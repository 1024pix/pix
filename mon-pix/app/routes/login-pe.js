import Route from '@ember/routing/route';

import getAbsoluteUrl from 'ember-simple-auth-oidc/utils/absoluteUrl';
import { inject as service } from '@ember/service';

import { v4 } from 'uuid';
import config from 'ember-simple-auth-oidc/config';

const { host, clientId, authEndpoint } = config;

export default class LoginPeRoute extends Route {

  @service session;
  @service router;

  get redirectUri() {
    const { protocol, host } = location;
    const path = this.router.urlFor(this.routeName);
    return `${protocol}//${host}${path}`;
  }

  async afterModel(_, transition) {
    if (!authEndpoint) {
      throw new Error('There is no authEndpoint configured.');
    }

    const queryParams = transition.to
      ? transition.to.queryParams
      : transition.queryParams;

    if (queryParams.code) {
      return await this._handleCallbackRequest(
        queryParams.code,
        queryParams.state,
      );
    }

    return this._handleRedirectRequest();
  }

  async _handleCallbackRequest(code, state) {
    if (state !== this.session.data.state) {
      throw new Error('State did not match');
    }

    this.session.set('data.state', undefined);

    await this.session.authenticate('authenticator:oidc', {
      code,
      redirectUri: this.redirectUri,
    });
  }

  _handleRedirectRequest() {
    const scope = `application_${clientId}%20api_peconnect-individuv1%20openid%20profile%20serviceDigitauxExposition%20api_peconnect-servicesdigitauxv1`;

    const state = v4();
    const nonce = v4();

    this.session.set('data.state', state);

    /**
     * Store the `nextURL` in the localstorage so when the user returns after
     * the login he can be sent to the initial destination.
     */
    if (!this.session.get('data.nextURL')) {
      this.session.set(
        'data.nextURL',
        this.session.get('attemptedTransition.intent.url'),
      );
    }

    const search = [
      `client_id=${clientId}`,
      `redirect_uri=${this.redirectUri}`,
      'response_type=code',
      `state=${state}`,
      `scope=${scope}`,
      `nonce=${nonce}`,
    ]
      .filter(Boolean)
      .join('&');

    const updatedAuthEndpoint = `${authEndpoint}?realm=%2Findividu`;

    location.replace(`${getAbsoluteUrl(host)}${updatedAuthEndpoint}&${search}`);
  }
}

