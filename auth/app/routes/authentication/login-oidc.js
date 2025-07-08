import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'auth/config/environment';

export default class LoginOidcRoute extends Route {
  @service router;
  @service location;
  @service authentication;
  @service oidcIdentityProviders;

  beforeModel(transition) {
    const queryParams = transition.to.queryParams;

    if (!queryParams.code) {
      // When correctly redirected from an OIDC provider
      const identityProviderSlug = transition.to.params.identity_provider_slug.toString();
      const identityProvider = this.oidcIdentityProviders.list.find((provider) => provider.id === identityProviderSlug);
      if (identityProvider !== undefined) {
        return this._handleRedirectRequest(identityProvider);
      }
    }
  }

  async model(params, transition) {
    await this.oidcIdentityProviders.loadReadyIdentityProviders();

    const queryParams = transition.to.queryParams;
    const identityProviderSlug = params.identity_provider_slug;
    const identityProvider = this.oidcIdentityProviders.list.find((provider) => provider.id === identityProviderSlug);
    if (queryParams.code) {
      return this._handleCallbackRequest(queryParams.code, queryParams.state, queryParams.iss, identityProvider.code);
    }
  }

  async afterModel({ shouldUserCreateAnAccount, authenticationKey, identityProviderSlug, email } = {}) {
    // todo(auth) reconciliation when account not found ?
  }

  async _handleCallbackRequest(code, state, iss, identityProviderCode) {
    const redirectUri = window.sessionStorage.getItem('redirectUri');
    const scope = window.sessionStorage.getItem('scope');
    const stateOrigin = window.sessionStorage.getItem('state');
    const codeChallenge = window.sessionStorage.getItem('codeChallenge');
    const codeChallengeMethod = window.sessionStorage.getItem('codeChallengeMethod');
    const clientId = window.sessionStorage.getItem('clientId');

    await this.authentication.authenticate({
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      state: stateOrigin,
      scope,
      credentials: { code, state, iss, identity_provider: identityProviderCode },
    });
  }

  async _handleRedirectRequest(identityProvider) {
    const response = await fetch(`${ENV.APP.API_HOST}/api/oidc/authorization-url?identity_provider=${identityProvider.code}`);
    const { redirectTarget } = await response.json();
    this.location.replace(redirectTarget);
  }
}
