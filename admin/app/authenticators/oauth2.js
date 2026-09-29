import { service } from '@ember/service';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-admin/config/environment';

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

    await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/logout`,
      method: 'POST',
    });
  }
}
