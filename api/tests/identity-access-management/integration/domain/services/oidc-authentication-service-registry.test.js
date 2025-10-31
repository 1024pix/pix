import { OidcAuthenticationServiceRegistry } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import { oidcProviderRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { InvalidIdentityProviderError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | Service | oidc-authentication-service-registry', function () {
  let oidcAuthenticationServiceRegistry;

  before(async function () {
    const genericOidcProviderProperties = {
      enabled: true,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'OIDC_EXAMPLE',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };
    await databaseBuilder.factory.buildOidcProvider(genericOidcProviderProperties);

    const genericDisabledOidcProviderProperties = {
      enabled: false,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'OIDC_EXAMPLE_DISABLED',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };
    await databaseBuilder.factory.buildOidcProvider(genericDisabledOidcProviderProperties);

    const genericOidcProviderFoxPixAdminProperties = {
      application: 'admin',
      applicationTld: '.fr',
      enabledForPixAdmin: true,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'OIDC_EXAMPLE_FOR_PIX_ADMIN',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://admin.dev.pix.fr/connexion/oidc-example-net',
      scope: 'openid profile',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };
    await databaseBuilder.factory.buildOidcProvider(genericOidcProviderFoxPixAdminProperties);

    const poleEmploiOidcProviderProperties = {
      additionalRequiredProperties: {
        logoutUrl: 'https://example.net',
        afterLogoutUrl: 'https://example.net',
        sendingUrl: 'https://example.net',
      },
      enabled: true,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'POLE_EMPLOI',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };
    await databaseBuilder.factory.buildOidcProvider(poleEmploiOidcProviderProperties);

    const fwbOidcProviderProperties = {
      additionalRequiredProperties: { logoutUrl: 'https://example.net' },
      enabled: true,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'FWB',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      scope: 'openid profile',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };
    await databaseBuilder.factory.buildOidcProvider(fwbOidcProviderProperties);

    await databaseBuilder.commit();

    oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry({ oidcProviderRepository });
  });

  describe('#getAllOidcProviderServices', function () {
    it('returns all OIDC Providers', async function () {
      // given
      await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

      // when
      const services = oidcAuthenticationServiceRegistry.getAllOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes).to.have.lengthOf(5);
      expect(serviceCodes).to.contain('OIDC_EXAMPLE');
      expect(serviceCodes).to.contain('OIDC_EXAMPLE_DISABLED');
      expect(serviceCodes).to.contain('OIDC_EXAMPLE_FOR_PIX_ADMIN');
      expect(serviceCodes).to.contain('POLE_EMPLOI');
      expect(serviceCodes).to.contain('FWB');
    });
  });

  describe('#getReadyOidcProviderServices', function () {
    it('returns ready OIDC Providers', async function () {
      // given
      await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

      // when
      const services = oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes).to.have.lengthOf(3);
      expect(serviceCodes).to.contain('OIDC_EXAMPLE');
      expect(serviceCodes).to.contain('POLE_EMPLOI');
      expect(serviceCodes).to.contain('FWB');
    });
  });

  describe('#getReadyOidcProviderServicesForPixAdmin', function () {
    it('returns ready OIDC Providers for Pix Admin', async function () {
      // given
      await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

      // when
      const services = oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes).to.have.lengthOf(1);
      expect(serviceCodes).to.contain('OIDC_EXAMPLE_FOR_PIX_ADMIN');
    });
  });

  describe('#getOidcProviderServiceByCode', function () {
    it('returns a ready OIDC Provider for Pix App', async function () {
      // given
      await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

      // when
      const service = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
        identityProviderCode: 'OIDC_EXAMPLE',
      });

      // then
      expect(service.code).to.equal('OIDC_EXAMPLE');
    });

    describe('when the requestedApplication is admin', function () {
      it('returns a ready OIDC provider for Pix Admin', async function () {
        // given
        const requestedApplication = new RequestedApplication({ applicationName: 'admin', applicationTld: '.fr' });
        await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

        // when
        const service = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
          identityProviderCode: 'OIDC_EXAMPLE_FOR_PIX_ADMIN',
          requestedApplication,
        });

        // then
        expect(service.code).to.equal('OIDC_EXAMPLE_FOR_PIX_ADMIN');
      });
    });

    describe('when the OIDC Provider is not supported', function () {
      it('throws an error ', async function () {
        // given
        await oidcAuthenticationServiceRegistry.loadOidcProviderServices();

        // when
        const error = catchErrSync(
          oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode,
          oidcAuthenticationServiceRegistry,
        )({ identityProviderCode: 'OIDC_EXAMPLE_UNSUPPORTED' });

        // then
        expect(error).to.be.an.instanceOf(InvalidIdentityProviderError);
        expect(error.message).to.equal(`Identity provider OIDC_EXAMPLE_UNSUPPORTED is not supported.`);
      });
    });
  });
});
