import Route from '@ember/routing/route';
import OIDCAuthenticationRouteMixin from 'ember-simple-auth-oidc/mixins/oidc-authentication-route-mixin';

import getAbsoluteUrl from 'ember-simple-auth-oidc/utils/absoluteUrl';

import { v4 } from 'uuid';
import config from 'ember-simple-auth-oidc/config';

const { host, clientId, authEndpoint, loginHintName } = config;

export default class LoginPeRoute extends Route.extend(OIDCAuthenticationRouteMixin) {

  _handleRedirectRequest(queryParams) {
    const scope = `application_${clientId}%20api_peconnect-individuv1%20openid%20profile%20email`;

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

    const key = loginHintName || 'login_hint';

    const search = [
      `client_id=${clientId}`,
      `redirect_uri=${this.redirectUri}`,
      'response_type=code',
      `state=${state}`,
      `scope=${scope}`,
      `nonce=${nonce}`,
      queryParams[key] ? `${key}=${queryParams[key]}` : null,
    ]
      .filter(Boolean)
      .join('&');

    const updatedAuthEndpoint = `${authEndpoint}?realm=%2Findividu`;

    this._redirectToUrl(`${getAbsoluteUrl(host)}${updatedAuthEndpoint}&${search}`);
  }
}

