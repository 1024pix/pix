import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { decodeToken } from 'mon-pix/helpers/jwt';

import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class CnavAuthenticator extends BaseAuthenticator {
  @service session;
  @service location;

  async authenticate({ code, redirectUri, state, authenticationKey }) {
    const request = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };
    let serverTokenEndpoint;

    if (authenticationKey) {
      serverTokenEndpoint = `${ENV.APP.API_HOST}/api/cnav/users?authentication-key=${authenticationKey}`;
    } else {
      serverTokenEndpoint = `${ENV.APP.API_HOST}/api/cnav/token`;
      const bodyObject = {
        code,
        redirect_uri: redirectUri,
        state_sent: this.session.data.state,
        state_received: state,
      };

      request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      request.body = Object.keys(bodyObject)
        .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
        .join('&');

      if (this.session.isAuthenticated) {
        await this.session.invalidate();
      }
    }

    const response = await fetch(serverTokenEndpoint, request);

    const data = await response.json();
    if (!response.ok) {
      return RSVP.reject(data);
    }

    const decodedAccessToken = decodeToken(data.access_token);

    return {
      access_token: data.access_token,
      source: decodedAccessToken.source,
      user_id: decodedAccessToken.user_id,
    };
  }
}
