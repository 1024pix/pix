import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { v4 } from 'uuid';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

const { host, clientId, authEndpoint } = ENV.neo;

export default class LoginNEORoute extends Route {
  @service session;
  @service router;
  @service location;

  get redirectUri() {
    const { protocol, host } = location;
    const path = this.router.urlFor(this.routeName);
    return `${protocol}//${host}${path}`;
  }

  beforeModel(transition) {
    if (!authEndpoint) {
      throw new Error('There is no authEndpoint configured.');
    }

    const queryParams = transition.to ? transition.to.queryParams : transition.queryParams;
    if (!queryParams.code && queryParams.error) {
      return this.replaceWith('login');
    }

    if (!queryParams.code && !queryParams.error) {
      return this._handleRedirectRequest();
    }
  }

  async model(_, transition) {
    const queryParams = transition.to ? transition.to.queryParams : transition.queryParams;
    if (queryParams.code) {
      return this._handleCallbackRequest(queryParams.code, queryParams.state);
    }
  }

  afterModel({ shouldValidateCgu, authenticationKey } = {}) {
    if (shouldValidateCgu && authenticationKey) {
      return this.replaceWith('terms-of-service-neo', { queryParams: { authenticationKey } });
    }
  }

  async _handleCallbackRequest(code, state) {
    try {
      await this.session.authenticate('authenticator:neo', {
        code,
        redirectUri: this.redirectUri,
        state,
      });
    } catch (response) {
      const shouldValidateCgu = get(response, 'errors[0].code') === 'SHOULD_VALIDATE_CGU';
      const authenticationKey = get(response, 'errors[0].meta.authenticationKey');
      if (shouldValidateCgu && authenticationKey) {
        return { shouldValidateCgu, authenticationKey };
      }
      throw new Error(JSON.stringify(response.errors));
    } finally {
      this.session.set('data.state', undefined);
    }
  }

  _handleRedirectRequest() {
    const scope = 'userinfo';
    const state = 'blip';

    this.session.set('data.state', state);

    /**
     * Store the `attemptedTransition` in the localstorage so when the user returns after
     * the login he can be sent to the initial destination.
     */
    if (this.session.get('attemptedTransition')) {
      /**
       * There is two types of intent in transition (see: https://github.com/tildeio/router.js/blob/9b3d00eb923e0bbc34c44f08c6de1e05684b907a/ARCHITECTURE.md#transitionintent)
       * When the route is accessed by url (/campagnes/:code), the url is provided
       * When the route is accessed by the submit of the campaign code, the route name (campaigns.access) and contexts ([Campaign]) are provided
       */
      let { url } = this.session.get('attemptedTransition.intent');
      const { name, contexts } = this.session.get('attemptedTransition.intent');
      if (!url) {
        url = this.router.urlFor(name, contexts[0]);
      }
      this.session.set('data.nextURL', url);
    }
  
    const params = [
      'response_type=code',
      `state=${state}`,
      `scope=${scope}`,
      `client_id=${clientId}`,
      `redirect_uri=${this.redirectUri}`,
    ]
      .filter(Boolean)
      .join('&');

    this.location.replace(`${host}${authEndpoint}?${params}`);
  }
}
