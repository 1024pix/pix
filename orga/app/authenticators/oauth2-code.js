import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-orga/config/environment';

import { PKCEUtils } from '../utils/pkce.js';
import { run } from '@ember/runloop';

const CLIENT_ID = 'pix-orga';

export default class Oauth2Code extends OAuth2PasswordGrant {
  serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;

  static async authorize(_redirectUri) {
    // todo(auth):  This should be replaced with a real state
    const state = 'dummy-state';
    const pkce = await PKCEUtils.createPKCEPair();

    // todo(auth): see if sessionStorage is appropriate for storing the code verifier
    sessionStorage.setItem('code_verifier', pkce.codeVerifier);
    sessionStorage.setItem('state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: 'http://localhost:4201/auth/callback', // todo(auth): manage correctly redirect URI
      code_challenge: pkce.codeChallenge,
      code_challenge_method: pkce.method,
      state,
    });

    const response = await fetch(`${ENV.APP.API_HOST}/api/oauth/authorize?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const { redirect } = await response.json();

    if (!response.ok) {
      // todo(auth): handle error response when not authorized
      console.error('Error during OAuth2 authorization:', response.statusText);
      throw new Error('Authorization failed');
    }

    window.location.href = redirect;
  }

  authenticate(code, state, scope = [], headers = {}) {
    console.log('Oauth2 code authenticate', code, state, scope, headers);
    // call serverTokenEndpoint

    return new Promise((resolve, reject) => {
      const data = {
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        code_verifier: sessionStorage.getItem('code_verifier'),
      };
      const serverTokenEndpoint = this.serverTokenEndpoint;

      this.makeRequest(serverTokenEndpoint, data, headers).then(
        (response) => {
          // eslint-disable-next-line ember/no-runloop
          run(() => {
            if (!this._validate(response)) {
              reject('access_token is missing in server response');
            }

            const expiresAt = this._absolutizeExpirationTime(response['expires_in']);
            this._scheduleAccessTokenRefresh(
              response['expires_in'],
              expiresAt,
              response['refresh_token']
            );
            if (expiresAt) {
              response = Object.assign(response, { expires_at: expiresAt });
            }

            resolve(response);
          });
        },
        (response) => {
          // eslint-disable-next-line ember/no-runloop
          run(null, reject, response);
        }
      );
    });
  }
}
