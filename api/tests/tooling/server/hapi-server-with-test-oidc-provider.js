import { createServer } from '../../../server.js';
import { OidcAuthenticationService } from '../../../lib/domain/services/authentication/oidc-authentication-service.js';

async function createServerWithTestOidcProvider() {
  const oidcProviderServices = [
    new OidcAuthenticationService({
      authenticationUrl: 'https://oidc.example.net/authentication',
      clientId: 'client',
      clientSecret: 'secret',
      configKey: 'oidcExampleNet',
      endSessionUrl: 'https://oidc.example.net/end',
      hasLogoutUrl: false,
      identityProvider: 'OIDC_EXAMPLE_NET',
      jwtOptions: { expiresIn: 60 },
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
      tokenUrl: 'https://oidc.example.net/token',
      userInfoUrl: 'https://oidc.example.net/userinfo',
      wellKnownUrl: 'https://oidc.example.net/.well-known/openid-configuration',
    }),
  ];

  return createServer({ oidcProviderServices });
}

export { createServerWithTestOidcProvider };
