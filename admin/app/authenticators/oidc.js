import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { jwtDecode } from 'jwt-decode';
import ENV from 'pix-admin/config/environment';

export default class OidcAuthenticator extends BaseAuthenticator {
  @service session;
  @service oidcIdentityProviders;

  async authenticate({ code, state, iss, authenticationKey, email, identityProviderSlug }) {
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
        iss,
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
      return Promise.reject(data);
    }

    const decodedAccessToken = jwtDecode(data.access_token);

    return {
      access_token: data.access_token,
      user_id: decodedAccessToken.user_id,
      source: identityProvider.source,
      identityProviderCode: identityProvider.code,
    };
  }

  restore(data) {
    return new Promise((resolve, reject) => {
      const accessToken = data['access_token'];

      if (isEmpty(accessToken)) {
        reject();
        return;
      }

      try {
        const decodedAccessToken = jwtDecode(accessToken);
        const nowInSeconds = Math.floor(Date.now() / 1000);

        if (typeof decodedAccessToken.exp === 'number' && decodedAccessToken.exp > nowInSeconds) {
          resolve(data);
          return;
        }
      } catch {
      }

      reject();
    });
  }
}
