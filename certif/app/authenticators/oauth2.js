import { service } from '@ember/service';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-certif/config/environment';

export default class OAuth2 extends OAuth2PasswordGrant {
  serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;
  sendClientIdAsQueryParam = true;
  refreshAccessTokensWithScope = true;

  @service featureToggles;
  @service requestManager;

  async invalidate(data) {
    if (!this.featureToggles.featureToggles.isSessionLogoutEnabled) {
      return super.invalidate(data);
    }

    try {
      await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/logout`,
        method: 'POST',
      });
    } catch (err) {
      // eslint-disable-next-line no-console -- for diagnostics
      console.log('Pix API logout failed but ignoring error to clear authentication on client side:', err);
    }
  }
}
