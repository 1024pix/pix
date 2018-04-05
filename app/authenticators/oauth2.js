import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-admin/config/environment';

export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: `${ENV.apiHost}/token`,
  serverTokenRevocationEndpoint: `${ENV.apiHost}/revoke`
});
