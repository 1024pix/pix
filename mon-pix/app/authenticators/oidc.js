import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';

import OIDCAuthenticator from 'ember-simple-auth-oidc/authenticators/oidc';
import getAbsoluteUrl from 'ember-simple-auth-oidc/utils/absoluteUrl';
import { decodeToken } from 'mon-pix/helpers/jwt';

import config from 'ember-simple-auth-oidc/config';
import ENV from 'mon-pix/config/environment';

const serverTokenEndpoint = `${ENV.APP.API_HOST}/api/pole-emploi/token`;

const {
  host,
  clientId,
  afterLogoutUri,
  endSessionEndpoint,
} = config;

export default OIDCAuthenticator.extend({

  async authenticate({ code, redirectUri }) {
    const bodyObject = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
    };

    const body = Object.keys(bodyObject)
      .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
      .join('&');

    const response = await fetch(serverTokenEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await response.json();
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
