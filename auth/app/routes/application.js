import Route from '@ember/routing/route';

export default class ApplicationRoute extends Route {
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
    const redirectUri = params.redirect_uri;
    const scope = params.scope;
    const state = params.state;
    const codeChallenge = params.code_challenge;
    const codeChallengeMethod = params.code_challenge_method;
    const clientId = params.client_id;

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
