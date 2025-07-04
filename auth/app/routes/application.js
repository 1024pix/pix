import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service authentication;
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
  }

  async model (params) {
    const redirectUri = params.redirect_uri || 'http://localhost:4200';
    const scope = params.scope;
    const state = params.state;
    const codeChallenge = params.code_challenge;
    const codeChallengeMethod = params.code_challenge_method;
    const clientId = params.client_id;

    await this.authentication.setup(redirectUri);
    return {
      redirect_uri: redirectUri,
      scope,
      state,
      codeChallenge,
      codeChallengeMethod,
      clientId,
    }
  }
}
