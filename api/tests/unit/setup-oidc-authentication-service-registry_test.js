import { oidcAuthenticationServiceRegistry } from '../../lib/domain/services/authentication/authentication-service-registry.js';
import { expect, sinon } from '../test-helper.js';
import { setupOidcAuthenticationServiceRegistry } from '../../config/setup-oidc-authentication-service-registry.js';
import { OidcAuthenticationService } from '../../lib/domain/services/authentication/oidc-authentication-service.js';

describe('Unit | Config | setup-oidc-authentication-service-registry', function () {
  beforeEach(function () {
    sinon.stub(oidcAuthenticationServiceRegistry, 'loadOidcProviderServices');
  });

  context('when parameter is null or undefined', function () {
    it('loads all available OIDC provider services and configures ready services', async function () {
      // when
      await setupOidcAuthenticationServiceRegistry();

      // then
      expect(oidcAuthenticationServiceRegistry.loadOidcProviderServices).to.have.been.calledOnce;
    });
  });

  context('when parameter is an empty array of OIDC provider services', function () {
    it('does nothing', async function () {
      // given
      const oidcProviderServices = [];

      // when
      await setupOidcAuthenticationServiceRegistry(oidcProviderServices);

      // then
      expect(oidcAuthenticationServiceRegistry.loadOidcProviderServices).to.have.been.calledOnceWithExactly([]);
    });
  });

  context('when parameter is an array which contains at least one OIDC provider services', function () {
    it('loads the services and configures only ready services', async function () {
      // given
      const oidcProviderServices = [
        new OidcAuthenticationService({
          clientId: 'client',
          clientSecret: 'secret',
          configKey: 'oidcExampleNet',
          endSessionUrl: 'https://oidc.example.net/end',
          hasLogoutUrl: false,
          identityProvider: 'OIDC_EXAMPLE_NET',
          jwtOptions: { expiresIn: 60 },
          openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
          organizationName: 'OIDC Example',
          redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
          slug: 'oidc-example-net',
          source: 'oidcexamplenet',
        }),
      ];

      // when
      await setupOidcAuthenticationServiceRegistry(oidcProviderServices);

      // then
      expect(oidcAuthenticationServiceRegistry.loadOidcProviderServices).to.have.been.calledOnceWithExactly(
        oidcProviderServices,
      );
    });
  });
});
