import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import fetch from 'fetch';
import ENV from 'pix-admin/config/environment';
import { decodeToken } from 'pix-admin/helpers/jwt';
import RSVP from 'rsvp';

export default class OidcAuthenticator extends BaseAuthenticator {
  @service session;
  @service oidcIdentityProviders;

  async authenticate({ code, redirectUri, state, authenticationKey, hostSlug, email, identityProviderSlug }) {
    const request = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    let host = `${ENV.APP.API_HOST}/api/oidc/`;
    let body;
    const identityProvider = this.oidcIdentityProviders.list.find((provider) => provider.id === identityProviderSlug);

    if (authenticationKey) {
      host = `${ENV.APP.API_HOST}/api/admin/oidc/`;
      body = {
        identity_provider: identityProvider.code,
        authentication_key: authenticationKey,
        email,
      };
    } else {
      body = {
        identity_provider: identityProvider.code,
        code,
        redirect_uri: redirectUri,
        state: state,
        audience: 'admin',
      };

      if (this.session.isAuthenticated) {
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
      user_id: decodedAccessToken.user_id,
      source: identityProvider.source,
      identityProviderCode: identityProvider.code,
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
}
