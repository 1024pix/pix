import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';

export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: 'http://localhost:3000/token',
  serverTokenRevocationEndpoint: 'http://localhost:3000/revoke'
});
