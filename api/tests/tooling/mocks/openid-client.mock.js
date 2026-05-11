import sinon from 'sinon';

import { OidcAuthenticationService } from '../../../src/identity-access-management/domain/services/oidc-authentication-service.js';
import { oidcAuthenticationServiceRegistry } from '../../../src/identity-access-management/domain/usecases/index.js';

const clientId = 'client';
const scope = 'openid profile';
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

export function createOpenIdClientMock(oidcProviderConfig = Symbol('oidcProviderConfig')) {
  return {
    discovery: sinon.stub().resolves(oidcProviderConfig),
    authorizationCodeGrant: sinon.stub(),
    buildAuthorizationUrl: sinon.stub(),
    buildEndSessionUrl: sinon.stub(),
    fetchUserInfo: sinon.stub(),
  };
}

export async function createMockedTestOidcProviders(mockedProviders) {
  const openidClientMocks = [];
  const oidcAuthenticationServices = [];

  for (const mockedProvider of mockedProviders) {
    const {
      application,
      applicationTld,
      connectionMethodCode,
      identityProvider = 'OIDC_EXAMPLE_NET',
      organizationName = 'OIDC Example',
      slug = 'oidc-example-net',
      source = 'oidcexamplenet',
      postLogoutRedirectUri,
    } = mockedProvider;

    const openidClientMock = createOpenIdClientMock(openIdConfigurationResponse);

    const redirectUri = `https://${application}.dev.pix${applicationTld}/connexion/oidc-example-net`;

    const authorizationUrl = `${openIdConfigurationResponse.authorization_endpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=state&nonce=nonce`;
    openidClientMock.buildAuthorizationUrl.returns(authorizationUrl);

    const endSessionUrl = `${openIdConfigurationResponse.end_session_endpoint}?client_id=${clientId}`;
    openidClientMock.buildEndSessionUrl.returns(endSessionUrl);

    openidClientMocks.push(openidClientMock);
    oidcAuthenticationServices.push(
      new OidcAuthenticationService(
        {
          accessTokenLifespanMs: 60000,
          application,
          applicationTld,
          clientId,
          clientSecret: 'secret',
          connectionMethodCode,
          enabled: true,
          enabledForPixAdmin: true,
          configKey: 'oidcExampleNet',
          shouldCloseSession: true,
          identityProvider,
          openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
          organizationName,
          redirectUri,
          slug,
          source,
          postLogoutRedirectUri,
        },
        { openidClient: openidClientMock },
      ),
    );
  }

  await oidcAuthenticationServiceRegistry.testOnly_reset(oidcAuthenticationServices);

  return openidClientMocks;
}
