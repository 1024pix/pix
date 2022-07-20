import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class LoginOidcRoute extends Route {
  @service session;
  @service router;
  @service location;

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;
    if (queryParams.error) {
      throw new Error(`${queryParams.error}: ${queryParams.error_description}`);
    }

    if (!queryParams.code) {
      const identityProviderName = transition.to.params.identity_provider_name.toString();
      return this._handleRedirectRequest(identityProviderName);
    }
  }

  async model(params, transition) {
    const queryParams = transition.to.queryParams;
    const identityProviderName = params.identity_provider_name;
    if (queryParams.code) {
      return this._handleCallbackRequest(queryParams.code, queryParams.state, identityProviderName);
    }
  }

  afterModel({ shouldValidateCgu, authenticationKey, identityProviderName } = {}) {
    if (shouldValidateCgu && authenticationKey) {
      return this.router.replaceWith('terms-of-service-oidc', {
        queryParams: {
          authenticationKey,
          identityProviderName,
        },
      });
    }
  }

  async _handleCallbackRequest(code, state, identityProviderName) {
    try {
      const redirectUri = this._getRedirectUri(identityProviderName);
      await this.session.authenticate(`authenticator:${identityProviderName}`, {
        code,
        redirectUri,
        state,
      });
    } catch (response) {
      const shouldValidateCgu = get(response, 'errors[0].code') === 'SHOULD_VALIDATE_CGU';
      const authenticationKey = get(response, 'errors[0].meta.authenticationKey');
      if (shouldValidateCgu && authenticationKey) {
        return { shouldValidateCgu, authenticationKey, identityProviderName };
      }
      throw new Error(JSON.stringify(response.errors));
    } finally {
      this.session.set('data.state', undefined);
      this.session.set('data.nonce', undefined);
    }
  }

  _getRedirectUri(identityProviderName) {
    const { protocol, host } = location;
    // TODO a modifier en connexion/identityProviderName quand la CNAV et Pole Emploi ont pris en compte le changement
    return `${protocol}//${host}/connexion-${identityProviderName}`;
  }

  async _handleRedirectRequest(identityProviderName) {
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

    const redirectUri = this._getRedirectUri(identityProviderName);
    const response = await fetch(
      `${ENV.APP.API_HOST}/api/${identityProviderName}/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`
    );
    const { redirectTarget, state, nonce } = await response.json();
    this.session.set('data.state', state);
    this.session.set('data.nonce', nonce);
    this.location.replace(redirectTarget);
  }
}
