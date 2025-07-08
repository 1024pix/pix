import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'auth/config/environment';

export default class LoginOidcRoute extends Route {
  @service router;
  @service location;
  @service oidcIdentityProviders;

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;
    if (!queryParams.code) {

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
      return this._handleCallbackRequest(queryParams.code, queryParams.state, queryParams.iss, identityProviderSlug);
    }
  }

  async afterModel({ shouldUserCreateAnAccount, authenticationKey, identityProviderSlug, email } = {}) {

  }


  async _handleCallbackRequest(code, state, iss, identityProviderSlug) {

  }

  async _handleRedirectRequest(identityProvider) {
    const response = await fetch(
      `${ENV.APP.API_HOST}/api/oidc/authorization-url?identity_provider=${identityProvider.code}`,
    );
    const { redirectTarget } = await response.json();
    this.location.replace(redirectTarget);
  }
}
