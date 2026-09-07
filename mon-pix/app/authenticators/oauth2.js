import { service } from '@ember/service';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'mon-pix/config/environment';
import { decodeToken } from 'mon-pix/helpers/jwt';

export default class OAuth2 extends OAuth2PasswordGrant {
  serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;
  refreshAccessTokensWithScope = true;

  @service featureToggles;

  authenticate({ login, password, token }) {
    if (token) {
      const token_type = 'bearer';
      const decodedAccessToken = decodeToken(token);
      const user_id = decodedAccessToken.user_id;
      const source = decodedAccessToken.source;
      return Promise.resolve({
        token_type,
        access_token: token,
        user_id,
        source,
      });
    }

    return super.authenticate(login, password);
  }

  async invalidate(data) {
    if (!this.featureToggles.featureToggles.isSessionLogoutEnabled) {
      return super.invalidate(data);
    }

    await fetch(`${ENV.APP.API_HOST}/api/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });
  }
}
