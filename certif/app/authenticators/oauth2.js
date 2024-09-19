import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-certif/config/environment';

export default class OAuth2 extends OAuth2PasswordGrant {
  serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;
  sendClientIdAsQueryParam = true;
  refreshAccessTokensWithScope = true;

  restore(data) {
    return super.restore({ ...data, scope: ENV.APP.AUTHENTICATION.SCOPE });
  }
}
