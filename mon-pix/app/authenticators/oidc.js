import RSVP from 'rsvp';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { decodeToken } from 'mon-pix/helpers/jwt';
import IdentityProviders from 'mon-pix/identity-providers';
import ENV from 'mon-pix/config/environment';
import fetch from 'fetch';

export default class OidcAuthenticator extends BaseAuthenticator {
  @service session;
  @service location;
  @service featureToggles;

  async authenticate({ code, redirectUri, state, identityProviderSlug, authenticationKey }) {
    const request = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    const host = `${ENV.APP.API_HOST}/api/oidc/`;
    let hostSlug, body;
    const identity_provider = IdentityProviders[identityProviderSlug]?.code;

    if (authenticationKey) {
      hostSlug = 'users';
      body = {
        identity_provider,
        authentication_key: authenticationKey,
      };
    } else {
      hostSlug = 'token';
      body = {
        identity_provider,
        code,
        redirect_uri: redirectUri,
        state_sent: this.session.data.state,
        state_received: state,
      };

      if (this.session.isAuthenticated) {
        if (!this.featureToggles.featureToggles.isSsoAccountReconciliationEnabled) {
          const accessToken = this.session.get('data.authenticated.access_token');
          request.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        this.session.set('skipRedirectAfterSessionInvalidation', true);
        await this.session.invalidate();
      }
    }

    request.body = JSON.stringify({ data: { attributes: body } });
    const response = await fetch(host + hostSlug, request);

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
      identity_provider_code: decodedAccessToken.identity_provider,
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

  async invalidate(data) {
    if (data?.identity_provider_code !== 'POLE_EMPLOI') return;

    const { access_token, logout_url_uuid } = this.session.data.authenticated;

    const response = await fetch(
      `${ENV.APP.API_HOST}/api/oidc/redirect-logout-url?identity_provider=POLE_EMPLOI&logout_url_uuid=${logout_url_uuid}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const { redirectLogoutUrl } = await response.json();

    this.session.alternativeRootURL = redirectLogoutUrl;
  }
}
