import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { jwtDecode } from 'jwt-decode';
import ENV from 'pix-admin/config/environment';

export default class OidcAuthenticator extends BaseAuthenticator {
  @service featureToggles;
  @service oidcIdentityProviders;
  @service session;
  @service requestManager;

  async authenticate({ code, state, iss, authenticationKey, email, identityProviderSlug }) {
    const identityProvider = this.oidcIdentityProviders.findBySlug(identityProviderSlug);

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
      expiresAt: decodedAccessToken.exp * 1000,
      logoutUrlUuid: data.logout_url_uuid,
      source: identityProvider.source,
      shouldCloseSession: identityProvider.shouldCloseSession,
      identityProviderCode: identityProvider.code,
    };
  }

  restore(data) {
    return new Promise((resolve, reject) => {
      if (isEmpty(data['access_token'])) {
        reject();
      }
      if (data.expiresAt <= new Date().getTime()) {
        reject();
      }

      resolve(data);
    });
  }

  /**
   * @param {Object} data - The current authenticated session data
   */
  async invalidate(data) {
    const { access_token, shouldCloseSession, identityProviderCode, logoutUrlUuid } = data || {};

    if (this.featureToggles.featureToggles.isSessionLogoutEnabled) {
      const response = await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/oidc/logout`,
        method: 'POST',
        body: JSON.stringify({
          identity_provider: identityProviderCode,
          logout_url_uuid: logoutUrlUuid,
        }),
      });

      const { redirectLogoutUrl } = response.content;
      if (redirectLogoutUrl) {
        this.session.alternativeRootURL = redirectLogoutUrl;
      }
    } else {
      // Old implementation

      if (!shouldCloseSession) {
        return;
      }

      const response = await fetch(
        `${ENV.APP.API_HOST}/api/oidc/redirect-logout-url?identity_provider=${identityProviderCode}&logout_url_uuid=${logoutUrlUuid}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      const { redirectLogoutUrl } = await response.json();

      this.session.alternativeRootURL = redirectLogoutUrl;
    }
  }
}
