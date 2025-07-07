import { run } from '@ember/runloop';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-admin/config/environment';

import { PKCEUtils } from '../utils/pkce.js';

const CLIENT_ID = 'pix-admin';

export default class Oauth2Code extends OAuth2PasswordGrant {
  serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;

  static async buildAuthorizationUri(redirectUri) {
    const state = crypto.randomUUID();
    const pkce = await PKCEUtils.createPKCEPair();

    sessionStorage.setItem('code_verifier', pkce.codeVerifier);
    sessionStorage.setItem('state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
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

    return redirect;
  }

  authenticate(code, state, _scope = [], headers = {}) {
    const originalState = sessionStorage.getItem('state');

    if (state !== originalState) {
      return Promise.reject(new Error('State does not match'));
    }

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
            this._scheduleAccessTokenRefresh(response['expires_in'], expiresAt, response['refresh_token']);
            if (expiresAt) {
              response = Object.assign(response, { expires_at: expiresAt });
            }

            resolve(response);
          });
        },
        (response) => {
          // eslint-disable-next-line ember/no-runloop
          run(null, reject, response);
        },
      );
    });
  }
}
