import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'mon-pix/config/environment';
import { decodeToken } from 'mon-pix/helpers/jwt';
import RSVP from 'rsvp';

export default class OAuth2 extends OAuth2PasswordGrant {
  serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;

  authenticate({ login, password, scope, token }) {
    if (token) {
      const token_type = 'bearer';
      const decodedAccessToken = decodeToken(token);
      const user_id = decodedAccessToken.user_id;
      const source = decodedAccessToken.source;
      return RSVP.resolve({
        token_type,
        access_token: token,
        user_id,
        source,
      });
    }

    return super.authenticate(login, password, scope);
  }
}
