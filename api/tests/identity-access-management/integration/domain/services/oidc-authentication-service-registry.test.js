import { OidcAuthenticationServiceRegistry } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import { oidcProviderRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { InvalidIdentityProviderError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Identity Access Management | Domain | Service | oidc-authentication-service-registry', function () {
  let oidcAuthenticationServiceRegistry;

  before(async function () {
    const genericOidcProviderProperties = {
      application: 'app',
      applicationTld: '.org',
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
      application: 'app',
      applicationTld: '.org',
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
      application: 'app',
      applicationTld: '.fr',
      enabled: true,
      accessTokenLifespan: '7d',
      clientId: 'client',
      clientSecret: 'plainTextSecret',
      shouldCloseSession: true,
      identityProvider: 'POLE_EMPLOI',
      openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
      organizationName: 'OIDC Example',
      redirectUri: 'https://app.dev.pix.fr/connexion/oidc-example-net',
      scope: 'openid profile',
      slug: 'oidc-example-net',
      source: 'oidcexamplenet',
    };
    await databaseBuilder.factory.buildOidcProvider(poleEmploiOidcProviderProperties);

    const fwbOidcProviderProperties = {
      additionalRequiredProperties: { logoutUrl: 'https://example.net' },
      application: 'app',
      applicationTld: '.org',
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
      // when
      const services = await oidcAuthenticationServiceRegistry.getAllOidcProviderServices();

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

  describe('#getOidcProviderServicesByRequestedApplication', function () {
    it('returns ready OIDC Providers by requestedApplication', async function () {
      // given
      const requestedApplicationForApp = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });
      const requestedApplicationForAdmin = new RequestedApplication({
        applicationName: 'admin',
        applicationTld: '.fr',
      });

      // when
      const readyServicesForApp =
        await oidcAuthenticationServiceRegistry.getOidcProviderServicesByRequestedApplication(
          requestedApplicationForApp,
        );
      const readyServicesForAdmin =
        await oidcAuthenticationServiceRegistry.getOidcProviderServicesByRequestedApplication(
          requestedApplicationForAdmin,
        );

      // then
      const serviceCodesForApp = readyServicesForApp.map((service) => service.code);
      expect(serviceCodesForApp).to.have.lengthOf(2);
      expect(serviceCodesForApp).to.contain('OIDC_EXAMPLE');
      expect(serviceCodesForApp).to.contain('FWB');

      const serviceCodesForAdmin = readyServicesForAdmin.map((service) => service.code);
      expect(serviceCodesForAdmin).to.have.lengthOf(1);
      expect(serviceCodesForAdmin).to.contain('OIDC_EXAMPLE_FOR_PIX_ADMIN');
    });
  });

  describe('#getOidcProviderServiceByCode', function () {
    it('returns the ready OIDC Providers for Pix App', async function () {
      // given
      const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });

      // when
      const service = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
        identityProviderCode: 'OIDC_EXAMPLE',
        requestedApplication,
      });

      // then
      expect(service.code).to.equal('OIDC_EXAMPLE');
    });

    it('returns the ready OIDC Providers for Pix Admin', async function () {
      // given
      const requestedApplication = new RequestedApplication({ applicationName: 'admin', applicationTld: '.fr' });

      // when
      const service = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
        identityProviderCode: 'OIDC_EXAMPLE_FOR_PIX_ADMIN',
        requestedApplication,
      });

      // then
      expect(service.code).to.equal('OIDC_EXAMPLE_FOR_PIX_ADMIN');
    });

    describe('when the OIDC Provider is not for the requestedApplication', function () {
      it('throws an InvalidIdentityProviderError', async function () {
        // given
        const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.fr' });

        // when & then
        await expect(
          oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
            identityProviderCode: 'OIDC_EXAMPLE',
            requestedApplication,
          }),
        ).to.be.rejectedWith(InvalidIdentityProviderError, 'Identity provider OIDC_EXAMPLE is not supported.');
      });
    });

    describe('when the OIDC Provider is not supported', function () {
      it('throws an InvalidIdentityProviderError', async function () {
        // given
        const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });

        // when & then
        await expect(
          oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
            identityProviderCode: 'SOME_UNSUPPORTED_OP',
            requestedApplication,
          }),
        ).to.be.rejectedWith(InvalidIdentityProviderError, 'Identity provider SOME_UNSUPPORTED_OP is not supported.');
      });
    });
  });
});
