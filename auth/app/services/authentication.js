import Service from '@ember/service';
import environment from 'auth/config/environment';

export default class AuthenticationService extends Service {
  async authenticate({
    username,
    password,
    scope,
    state,
    codeChallenge,
    codeChallengeMethod,
    redirectUri,
    clientId,
  }) {
    const response = await fetch(
      `${environment.APP.API_HOST}/api/oauth/authorize`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          scope,
          client_id: clientId,
          redirect_uri: redirectUri,
          state,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod,
        }),
      },
    );

    const payload = await response.json();

    window.location = payload.redirect;
  }
}
