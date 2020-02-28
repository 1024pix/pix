import classic from 'ember-classic-decorator';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'pix-admin/config/environment';

@classic
export default class Oauth2 extends OAuth2PasswordGrant {

  serverTokenEndpoint = `${ENV.APP.API_HOST}/api/token`;
  serverTokenRevocationEndpoint = `${ENV.APP.API_HOST}/api/revoke`;
  sendClientIdAsQueryParam = true;
}
