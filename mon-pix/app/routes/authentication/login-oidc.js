import Route from '@ember/routing/route';
import { service } from '@ember/service';
import fetch from 'fetch';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import { createTranslatedApplicationError } from 'mon-pix/errors/factories/create-application-error';
import JSONApiError from 'mon-pix/errors/json-api-error';

export default class LoginOidcRoute extends Route {
  @service intl;
  @service location;
  @service oidcIdentityProviders;
  @service router;
  @service session;

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;
    if (queryParams.error) {
      const error = createTranslatedApplicationError.withCodeAndDescription({
        code: queryParams.error,
        description: queryParams.error_description,
        intl: this.intl,
      });
      throw error;
    }

    if (!queryParams.code) {
      this._cleanSession();

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

  afterModel({ shouldValidateCgu, authenticationKey, identityProviderSlug, givenName, familyName } = {}) {
    const shouldCreateAnAccountForUser = shouldValidateCgu && authenticationKey;

    if (!shouldCreateAnAccountForUser) return;

    return this.router.replaceWith('authentication.login-or-register-oidc', {
      queryParams: {
        authenticationKey,
        identityProviderSlug,
        givenName,
        familyName,
      },
    });
  }

  _cleanSession() {
    this.session.set('data.nextURL', undefined);
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
      const apiError = get(response, 'errors[0]');
      const error = new JSONApiError(apiError.detail, apiError);

      const shouldValidateCgu = error.code === 'SHOULD_VALIDATE_CGU';
      const { authenticationKey, givenName, familyName } = error.meta ?? {};
      if (shouldValidateCgu && authenticationKey) {
        return { shouldValidateCgu, authenticationKey, identityProviderSlug, givenName, familyName };
      }

      throw error;
    }
  }

  _getRedirectUri(identityProviderSlug) {
    const { protocol, host } = window.location;
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

    const identityProvider = this.oidcIdentityProviders[identityProviderSlug]?.code;
    const response = await fetch(
      `${ENV.APP.API_HOST}/api/oidc/authorization-url?identity_provider=${identityProvider}`,
    );
    const { redirectTarget } = await response.json();
    this.location.replace(redirectTarget);
  }
}
