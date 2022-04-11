import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { decodeToken } from 'mon-pix/helpers/jwt';

import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

const { host, afterLogoutUri, endSessionEndpoint } = ENV.poleEmploi;

export default class PoleEmploiAuthenticator extends BaseAuthenticator {
  @service session;
  @service location;

  async authenticate({ code, redirectUri, state, authenticationKey }) {
    let request;
    let serverTokenEndpoint;

    if (authenticationKey) {
      serverTokenEndpoint = `${ENV.APP.API_HOST}/api/pole-emploi/users?authentication-key=${authenticationKey}`;
      request = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      };
    } else {
      serverTokenEndpoint = `${ENV.APP.API_HOST}/api/pole-emploi/token`;
      const bodyObject = {
        code,
        redirect_uri: redirectUri,
        state_sent: this.session.data.state,
        state_received: state,
      };

      const body = Object.keys(bodyObject)
        .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
        .join('&');

      request = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      };

      // We want to authorize users connected to Pix to connect to Pole Emploi as well
      // in order to link their Pole Emploi account to the Pix one.
      if (this.session.isAuthenticated) {
        request.headers['Authorization'] = `Bearer ${this.session.data.authenticated.access_token}`;
        // We must ensure to disconnect the Pix user in order for the session service to fire
        // the authenticationSucceeded event (and thus execute the ApplicationRouteMixin sessionAuthenticated() method).
        // see: https://github.com/simplabs/ember-simple-auth/blob/92268fdcb9ac3d1c9f7b0abde4923dade7a0cd62/packages/ember-simple-auth/addon/internal-session.js#L95L106
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
      id_token: data.id_token,
      source: decodedAccessToken.source,
      user_id: decodedAccessToken.user_id,
      redirectUri,
    };
  }

  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      if (!isEmpty(data['access_token'])) {
        resolve(data);
      }
      reject();
    });
  }

  async invalidate() {
    const idToken = this.session.get('data.authenticated.id_token');

    if (!endSessionEndpoint) {
      return;
    }

    const params = [];

    if (afterLogoutUri) {
      params.push(`redirect_uri=${afterLogoutUri}`);
    }

    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }
    this.location.replace(`${host}${endSessionEndpoint}?${params.join('&')}`);
  }
}
