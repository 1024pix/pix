import Route from '@ember/routing/route';
import { service } from '@ember/service';

import get from 'lodash/get';
import ENV from 'pix-admin/config/environment';
import fetch from 'fetch';
import JSONApiError from 'pix-admin/errors/json-api-error';

export default class LoginOidcRoute extends Route {
  @service session;
  @service router;
  @service location;
  @service oidcIdentityProviders;

  _unsetOidcProperties() {
    this.session.set('data.nextURL', undefined);
    this.session.set('data.nonce', undefined);
    this.session.set('data.state', undefined);
  }

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;

    if (!queryParams.code) {
      this._unsetOidcProperties();

      const identityProviderSlug = transition.to.params.identity_provider_slug.toString();
      const isSupportedIdentityProvider = this.oidcIdentityProviders[identityProviderSlug] ?? null;
      if (isSupportedIdentityProvider) return this._handleRedirectRequest(identityProviderSlug);

      return this.router.replaceWith('login');
    }
  }

  async model(params, transition) {
    const queryParams = transition.to.queryParams;
    const identityProviderSlug = params.identity_provider_slug;
    if (queryParams.code) {
      return this._handleCallbackRequest(queryParams.code, queryParams.state, identityProviderSlug);
    }
  }

  async afterModel({ shouldUserCreateAnAccount, authenticationKey, identityProviderSlug, email } = {}) {
    if (!shouldUserCreateAnAccount && !authenticationKey) return;
    try {
      await this.session.authenticate('authenticator:oidc', {
        authenticationKey,
        identityProviderSlug,
        email,
        hostSlug: 'user/reconcile',
      });
    } catch (response) {
      const apiError = get(response, 'errors[0]');
      const error = new JSONApiError(apiError?.detail, apiError);

      let queryParams;

      if (error.status === '404' && error.code === 'USER_ACCOUNT_NOT_FOUND') {
        queryParams = { isUserShouldCreateAnAccount: true };
      } else {
        queryParams = { isUnknownErrorOccurs: true };
      }

      return this.router.replaceWith('login', {
        queryParams,
      });
    }
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

      const shouldUserCreateAnAccount = error.code === 'SHOULD_VALIDATE_CGU';
      const { authenticationKey, email } = error.meta ?? {};
      if (shouldUserCreateAnAccount && authenticationKey) {
        return { shouldUserCreateAnAccount, authenticationKey, email, identityProviderSlug };
      }

      if (error.status === '403' && error.code === 'PIX_ADMIN_ACCESS_NOT_ALLOWED') {
        return this.router.replaceWith('login', {
          queryParams: {
            isUserShouldRequestAccess: true,
          },
        });
      }

      throw error;
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
    const redirectUri = this._getRedirectUri(identityProviderSlug);
    const identityProvider = this.oidcIdentityProviders[identityProviderSlug]?.code;
    const response = await fetch(
      `${
        ENV.APP.API_HOST
      }/api/oidc/authentication-url?identity_provider=${identityProvider}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}`,
    );
    const { redirectTarget, state, nonce } = await response.json();
    this.session.set('data.state', state);
    this.session.set('data.nonce', nonce);
    this.location.replace(redirectTarget);
  }
}
