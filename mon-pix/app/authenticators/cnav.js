import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { decodeToken } from 'mon-pix/helpers/jwt';

import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class CnavAuthenticator extends BaseAuthenticator {
  @service session;
  @service location;

  async authenticate({ code, redirectUri, state }) {
    const bodyObject = {
      code,
      redirect_uri: redirectUri,
      state_sent: this.session.data.state,
      state_received: state,
    };

    const body = Object.keys(bodyObject)
      .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
      .join('&');

    const request = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    };

    const serverTokenEndpoint = `${ENV.APP.API_HOST}/api/cnav/token`;

    if (this.session.isAuthenticated) {
      await this.session.invalidate();
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

  //En a-t-on besoin ? Si oui pour quels scénarios ?
  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      if (!isEmpty(data['access_token'])) {
        resolve(data);
      }
      reject();
    });
  }
}
