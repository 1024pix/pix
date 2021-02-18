import Route from '@ember/routing/route';

import getAbsoluteUrl from 'ember-simple-auth-oidc/utils/absoluteUrl';
import { inject as service } from '@ember/service';

import { v4 } from 'uuid';
import config from 'ember-simple-auth-oidc/config';
import get from 'lodash/get';

const { host, clientId, authEndpoint } = config;

export default class LoginPeRoute extends Route {

  @service session;
  @service router;
  @service location;

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
    } else if (queryParams.error) {
      return this.replaceWith('login');
    }

    return this._handleRedirectRequest();
  }

  async _handleCallbackRequest(code, state) {
    if (state !== this.session.data.state) {
      throw new Error('State did not match');
    }

    this.session.set('data.state', undefined);

    try {
      await this.session.authenticate('authenticator:oidc', {
        code,
        redirectUri: this.redirectUri,
      });
    } catch (response) {
      const shouldValidateCgu = get(response, 'errors[0].code') === 'SHOULD_VALIDATE_CGU';
      const authenticationKey = get(response, 'errors[0].meta.authenticationKey');
      if (shouldValidateCgu && authenticationKey) {
        return this.replaceWith('terms-of-service-pe', { queryParams: { authenticationKey } });
      }
    }
  }

  _handleRedirectRequest() {
    const scope = `application_${clientId}%20api_peconnect-individuv1%20openid%20profile%20serviceDigitauxExposition%20api_peconnect-servicesdigitauxv1`;

    const state = v4();
    const nonce = v4();

    this.session.set('data.state', state);

    /**
     * Store the `attemptedTransition` in the localstorage so when the user returns after
     * the login he can be sent to the initial destination.
     */
    if (this.session.get('attemptedTransition')) {
      /**
       * There is two types of intent in transition (see: https://github.com/tildeio/router.js/blob/9b3d00eb923e0bbc34c44f08c6de1e05684b907a/ARCHITECTURE.md#transitionintent)
       * When the route is accessed by url (/campagnes/:code), the url is provided
       * When the route is accessed by the submit of the campaign code, the route name (campaigns.start-or-resume) and contexts ([Campaign]) are provided
       */

      let { url } = this.session.get('attemptedTransition.intent');
      const { name, contexts } = this.session.get('attemptedTransition.intent');
      if (!url) {
        url = this.router.urlFor(name, contexts[0]);
      }
      this.session.set('data.nextURL', url);
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

    this.location.replace(`${getAbsoluteUrl(host)}${updatedAuthEndpoint}&${search}`);
  }
}

