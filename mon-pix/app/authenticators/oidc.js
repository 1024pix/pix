import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { decodeToken } from 'mon-pix/helpers/jwt';

import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

const { host, afterLogoutUri, endSessionEndpoint } = ENV.poleEmploi;

export default class OidcAuthenticator extends BaseAuthenticator {
  @service session;
  @service location;

  async authenticate({ code, redirectUri, state, identityProviderName, authenticationKey }) {
    const request = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    };
    let serverTokenEndpoint;

    if (authenticationKey) {
      serverTokenEndpoint = `${ENV.APP.API_HOST}/api/${identityProviderName}/users?authentication-key=${authenticationKey}`;
    } else {
      serverTokenEndpoint = `${ENV.APP.API_HOST}/api/${identityProviderName}/token`;
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
        const accessToken = this.session.get('data.authenticated.access_token');
        request.headers['Authorization'] = `Bearer ${accessToken}`;
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
      logout_url_uuid: data.logout_url_uuid,
      source: decodedAccessToken.source,
      user_id: decodedAccessToken.user_id,
      identity_provider: decodedAccessToken.identity_provider,
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

  /**
   * @deprecated
   * @param idToken
   * @returns {string}
   * @private
   */
  _generateRedirectLogoutUrl(idToken) {
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

    return `${host}${endSessionEndpoint}?${params.join('&')}`;
  }

  async invalidate(data) {
    if (data?.identity_provider !== 'POLE_EMPLOI') return;

    let url = '';
    const { access_token, id_token, logout_url_uuid } = this.session.data.authenticated;

    if (id_token) {
      url = this._generateRedirectLogoutUrl(id_token);
    } else {
      const response = await fetch(
        `${ENV.APP.API_HOST}/api/oidc/redirect-logout-url?identity_provider=POLE_EMPLOI&logout_url_uuid=${logout_url_uuid}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const { redirectLogoutUrl } = await response.json();
      url = redirectLogoutUrl;
    }

    this.location.replace(url);
  }
}
