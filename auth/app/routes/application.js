import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service oidcIdentityProviders;
  queryParams = {
    redirect_uri: {
      refreshModel: true,
    },
    scope: {
      refreshModel: true,
    },
    state: {
      refreshModel: true,
    },
    code_challenge: {
      refreshModel: true,
    },
    code_challenge_method: {
      refreshModel: true,
    },
    client_id: {
      refreshModel: true,
    },
  };

  async model(params) {
    await this.oidcIdentityProviders.loadReadyIdentityProviders();

    const redirectUri = params.redirect_uri;
    const scope = params.scope;
    const state = params.state;
    const codeChallenge = params.code_challenge;
    const codeChallengeMethod = params.code_challenge_method;
    const clientId = params.client_id;

    if (clientId) {
      window.sessionStorage.setItem('redirectUri',redirectUri );
      window.sessionStorage.setItem('scope', scope);
      window.sessionStorage.setItem('state', state);
      window.sessionStorage.setItem('codeChallenge', codeChallenge);
      window.sessionStorage.setItem('codeChallengeMethod', codeChallengeMethod);
      window.sessionStorage.setItem('clientId', clientId);
    }

    return {
      redirectUri,
      scope,
      state,
      codeChallenge,
      codeChallengeMethod,
      clientId,
    };
  }
}
