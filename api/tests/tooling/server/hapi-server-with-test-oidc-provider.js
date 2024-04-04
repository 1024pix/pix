import nock from 'nock';

import { createServer } from '../../../server.js';
import { OidcAuthenticationService } from '../../../src/authentication/domain/services/oidc-authentication-service.js';

const openIdConfigurationResponse = {
  token_endpoint: 'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/token',
  token_endpoint_auth_methods_supported: ['client_secret_post', 'private_key_jwt', 'client_secret_basic'],
  jwks_uri: 'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/discovery/v2.0/keys',
  response_modes_supported: ['query', 'fragment', 'form_post'],
  subject_types_supported: ['pairwise'],
  id_token_signing_alg_values_supported: ['RS256'],
  response_types_supported: ['code', 'id_token', 'code id_token', 'id_token token'],
  scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
  issuer: 'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/v2.0',
  request_uri_parameter_supported: false,
  userinfo_endpoint: 'https://oidc.example.net/userinfo',
  authorization_endpoint: 'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/authorize',
  device_authorization_endpoint: 'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/devicecode',
  http_logout_supported: true,
  frontchannel_logout_supported: true,
  end_session_endpoint: 'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/logout',
  claims_supported: [
    'sub',
    'iss',
    'aud',
    'exp',
    'iat',
    'auth_time',
    'acr',
    'nonce',
    'preferred_username',
    'name',
    'tid',
    'ver',
    'at_hash',
    'c_hash',
    'email',
  ],
};

async function createServerWithTestOidcProvider() {
  nock('https://oidc.example.net').get('/.well-known/openid-configuration').reply(200, openIdConfigurationResponse);

  const oidcProviderServices = [
    new OidcAuthenticationService({
      accessTokenLifespanMs: 60000,
      clientId: 'client',
      clientSecret: 'secret',
      configKey: 'oidcExampleNet',
      shouldCloseSession: true,
      identityProvider: 'OIDC_EXAMPLE_NET',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    }),
  ];

  return createServer({ oidcProviderServices });
}

export { createServerWithTestOidcProvider };
