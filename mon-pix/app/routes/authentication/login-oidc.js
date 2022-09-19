import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class LoginOidcRoute extends Route {
  @service session;
  @service router;
  @service location;
  @service oidcIdentityProviders;
  @service featureToggles;

  _unsetOidcProperties() {
    this.session.set('data.nextURL', undefined);
    this.session.set('data.nonce', undefined);
    this.session.set('data.state', undefined);
  }

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;
    if (queryParams.error) {
      throw new Error(`${queryParams.error}: ${queryParams.error_description}`);
    }

    if (!queryParams.code) {
      this._unsetOidcProperties();

      const identityProviderSlug = transition.to.params.identity_provider_slug.toString();
      const isSupportedIdentityProvider = this.oidcIdentityProviders[identityProviderSlug] ?? null;
      if (isSupportedIdentityProvider) return this._handleRedirectRequest(identityProviderSlug);

      return this.router.replaceWith('authentication.login');
    }
  }

  async model(params, transition) {
    const queryParams = transition.to.queryParams;
    const identityProviderSlug = params.identity_provider_slug;
    if (queryParams.code) {
      return this._handleCallbackRequest(queryParams.code, queryParams.state, identityProviderSlug);
    }
  }

  afterModel({ shouldValidateCgu, authenticationKey, identityProviderSlug } = {}) {
    const shouldCreateAnAccountForUser = shouldValidateCgu && authenticationKey;

    if (!shouldCreateAnAccountForUser) return;

    if (this.featureToggles.featureToggles.isSsoAccountReconciliationEnabled) {
      return this.router.replaceWith('authentication.login-or-register-oidc', {
        queryParams: {
          authenticationKey,
          identityProviderSlug,
        },
      });
    }

    return this.router.replaceWith('terms-of-service-oidc', {
      queryParams: {
        authenticationKey,
        identityProviderSlug,
      },
    });
  }

  async _handleCallbackRequest(code, state, identityProviderSlug) {
    try {
      const redirectUri = this._getRedirectUri(identityProviderSlug);
      await this.session.authenticate('authenticator:oidc', {
        code,
        redirectUri,
        state,
        identityProviderSlug,
        hostSlug: 'token',
      });
    } catch (response) {
      const shouldValidateCgu = get(response, 'errors[0].code') === 'SHOULD_VALIDATE_CGU';
      const authenticationKey = get(response, 'errors[0].meta.authenticationKey');
      if (shouldValidateCgu && authenticationKey) {
        return { shouldValidateCgu, authenticationKey, identityProviderSlug };
      }
      throw new Error(JSON.stringify(response.errors));
    } finally {
      this.session.set('data.state', undefined);
      this.session.set('data.nonce', undefined);
    }
  }

  _getRedirectUri(identityProviderSlug) {
    const { protocol, host } = location;
    return `${protocol}//${host}/connexion/${identityProviderSlug}`;
  }

  async _handleRedirectRequest(identityProviderSlug) {
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

    const redirectUri = this._getRedirectUri(identityProviderSlug);
    const identityProvider = this.oidcIdentityProviders[identityProviderSlug]?.code;
    const response = await fetch(
      `${
        ENV.APP.API_HOST
      }/api/oidc/authentication-url?identity_provider=${identityProvider}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`
    );
    const { redirectTarget, state, nonce } = await response.json();
    this.session.set('data.state', state);
    this.session.set('data.nonce', nonce);
    this.location.replace(redirectTarget);
  }
}
