import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';

export default class OAuth2Authenticator extends OAuth2PasswordGrant {
  serverTokenEndpoint = 'http://localhost:4206/api/token'; // todo(auth): extract host to env
  serverTokenRevocationEndpoint = 'http://localhost:4206/api/revoke'; // todo(auth): extract host to env
  refreshAccessTokensWithScope = true;
}
