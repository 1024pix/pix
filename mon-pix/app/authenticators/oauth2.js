import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'mon-pix/config/environment';

export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: `${ENV.APP.API_HOST}/api/token`,
  serverTokenRevocationEndpoint: `${ENV.APP.API_HOST}/api/revoke`,
});
