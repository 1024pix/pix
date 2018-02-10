import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';

export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: 'http://localhost:9000/token',
  serverTokenRevocationEndpoint: 'http://localhost:9000/revoke'
});
