import Route from '@ember/routing/route';
import { service } from '@ember/service';
import fetch from 'fetch';
import get from 'lodash/get';
import ENV from 'pix-admin/config/environment';
import JSONApiError from 'pix-admin/errors/json-api-error';

export default class LoginOidcRoute extends Route {
  @service session;
  @service router;
  @service location;
  @service oidcIdentityProviders;

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;
    if (!queryParams.code) {
      this._cleanSession();

      const identityProviderSlug = transition.to.params.identity_provider_slug.toString();
      const identityProvider = this.oidcIdentityProviders.list.find((provider) => provider.id === identityProviderSlug);
      if (identityProvider !== undefined) return this._handleRedirectRequest(identityProvider);

      return this.router.replaceWith('login');
    }
  }

  async model(params, transition) {
    await this.oidcIdentityProviders.loadReadyIdentityProviders();

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
      });
    } catch (response) {
      const apiError = get(response, 'errors[0]');
      const error = new JSONApiError(apiError?.detail, apiError);

      let queryParams;

      if (error.status === '404' && error.code === 'USER_ACCOUNT_NOT_FOUND') {
        queryParams = { userShouldCreateAnAccount: true };
      } else {
        queryParams = { unknownErrorHasOccured: true };
      }

      return this.router.replaceWith('login', {
        queryParams,
      });
    }
  }

  _cleanSession() {
    this.session.set('data.nextURL', undefined);
  }

  async _handleCallbackRequest(code, state, identityProviderSlug) {
    try {
      await this.session.authenticate('authenticator:oidc', {
        code,
        state,
        identityProviderSlug,
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
            userShouldRequestAccess: true,
          },
        });
      }

      throw error;
    }
  }

  async _handleRedirectRequest(identityProvider) {
    const response = await fetch(
      `${ENV.APP.API_HOST}/api/oidc/authorization-url?identity_provider=${identityProvider.code}&audience=admin`,
    );
    const { redirectTarget } = await response.json();
    this.location.replace(redirectTarget);
  }
}
