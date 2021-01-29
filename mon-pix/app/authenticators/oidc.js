import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

import OIDCAuthenticator from 'ember-simple-auth-oidc/authenticators/oidc';
import getAbsoluteUrl from 'ember-simple-auth-oidc/utils/absoluteUrl';
import { decodeToken } from 'mon-pix/helpers/jwt';

import config from 'ember-simple-auth-oidc/config';
import ENV from 'mon-pix/config/environment';

const {
  host,
  clientId,
  afterLogoutUri,
  endSessionEndpoint,
} = config;

export default OIDCAuthenticator.extend({

  session: service(),

  async authenticate({ code, redirectUri, authenticationKey }) {
    let request;
    let serverTokenEndpoint;

    if (authenticationKey) {
      serverTokenEndpoint = `${ENV.APP.API_HOST}/api/users/pole-emploi?authentication-key=${authenticationKey}`;
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
        client_id: clientId,
        redirect_uri: redirectUri,
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
        this.session.invalidate();
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
  },

  restore(data) {
    return new RSVP.Promise((resolve, reject) => {
      if (!isEmpty(data['access_token'])) {
        resolve(data);
      }
      reject();
    });
  },

  singleLogout(idToken) {
    if (!endSessionEndpoint) {
      return;
    }

    const params = [];

    if (afterLogoutUri) {
      params.push(`redirect_uri=${getAbsoluteUrl(afterLogoutUri)}`);
    }

    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    location.replace(`${getAbsoluteUrl(endSessionEndpoint, host)}?${params.join('&')}`);
  },

});
