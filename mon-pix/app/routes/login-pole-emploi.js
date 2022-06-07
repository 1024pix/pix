import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class LoginPoleEmploiRoute extends Route {
  @service session;
  @service router;
  @service location;

  get redirectUri() {
    const { protocol, host } = location;
    const path = this.router.urlFor(this.routeName);
    return `${protocol}//${host}${path}`;
  }

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;
    if (queryParams.error) {
      return this.replaceWith('login');
    }

    if (!queryParams.code) {
      return this._handleRedirectRequest();
    }
  }

  async model(_, transition) {
    const queryParams = transition.to.queryParams;
    if (queryParams.code) {
      return this._handleCallbackRequest(queryParams.code, queryParams.state);
    }
  }

  afterModel({ shouldValidateCgu, authenticationKey } = {}) {
    if (shouldValidateCgu && authenticationKey) {
      return this.replaceWith('terms-of-service-pole-emploi', { queryParams: { authenticationKey } });
    }
  }

  async _handleCallbackRequest(code, state) {
    try {
      await this.session.authenticate('authenticator:pole-emploi', {
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

  async _handleRedirectRequest() {
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

    const response = await fetch(
      `${ENV.APP.API_HOST}/api/pole-emploi/auth-url?redirect_uri=${encodeURIComponent(this.redirectUri)}`
    );
    const { redirectTarget, state, nonce } = await response.json();
    this.session.set('data.state', state);
    this.session.set('data.nonce', nonce);
    this.location.replace(redirectTarget);
  }
}
