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

  async authenticate({ code, state, authenticationKey, email, identityProviderSlug }) {
    const identityProvider = this.oidcIdentityProviders.list.find((provider) => provider.id === identityProviderSlug);

    let url = `${ENV.APP.API_HOST}/api/admin/oidc/user/reconcile`;
    let body = {
      identity_provider: identityProvider.code,
      authentication_key: authenticationKey,
      email,
    };

    const isReconciliation = authenticationKey === undefined;
    if (isReconciliation) {
      url = `${ENV.APP.API_HOST}/api/oidc/token`;
      body = {
        identity_provider: identityProvider.code,
        code,
        state: state,
        audience: 'admin',
      };

      if (this.session.isAuthenticated) {
        this.session.set('skipRedirectAfterSessionInvalidation', true);
        await this.session.invalidate();
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { attributes: body } }),
    });

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
