import { InvalidIdentityProviderError } from '../../../../../lib/domain/errors.js';
import { oidcAuthenticationServiceRegistry } from '../../../../../lib/domain/services/authentication/oidc-authentication-service-registry.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { catchErrSync, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Services | authentication registry', function () {
  describe('#getAllOidcProviderServices', function () {
    it('returns all OIDC Providers', async function () {
      // given
      const firstOidcProviderService = {
        code: 'FIRST',
      };
      const secondOidcProviderService = {
        code: 'SECOND',
      };

      oidcAuthenticationServiceRegistry.loadOidcProviderServices([firstOidcProviderService, secondOidcProviderService]);

      // when
      const services = oidcAuthenticationServiceRegistry.getAllOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes.length).to.equal(2);
      expect(serviceCodes).to.contain('FIRST');
      expect(serviceCodes).to.contain('SECOND');
    });
  });

  describe('#getReadyOidcProviderServices', function () {
    it('returns ready OIDC Providers', function () {
      // given
      const firstOidcProviderService = {
        code: 'FIRST',
      };
      const secondOidcProviderService = {
        code: 'SECOND',
        isReady: true,
      };

      oidcAuthenticationServiceRegistry.loadOidcProviderServices([firstOidcProviderService, secondOidcProviderService]);

      // when
      const services = oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes.length).to.equal(1);
      expect(serviceCodes).to.contain('SECOND');
    });
  });

  describe('#getReadyOidcProviderServicesForPixAdmin', function () {
    it('returns ready OIDC Providers for Pix Admin', function () {
      // given
      const firstOidcProviderService = {
        code: 'FIRST',
        isReadyForPixAdmin: true,
      };
      const secondOidcProviderService = {
        code: 'SECOND',
      };

      oidcAuthenticationServiceRegistry.loadOidcProviderServices([firstOidcProviderService, secondOidcProviderService]);

      // when
      const services = oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes.length).to.equal(1);
      expect(serviceCodes).to.contain('FIRST');
    });
  });

  describe('#getOidcProviderServiceByCode', function () {
    describe('when the audience is admin', function () {
      it('returns a ready OIDC provider for Pix Admin', function () {
        // given
        const oidcProviderForPixApp = {
          code: 'PROVIDER_FOR_APP',
          isReady: true,
        };
        const oidcProviderForPixAdmin = {
          code: 'PROVIDER_FOR_ADMIN',
          isReadyForPixAdmin: true,
        };

        oidcAuthenticationServiceRegistry.loadOidcProviderServices([oidcProviderForPixApp, oidcProviderForPixAdmin]);

        // when
        const service = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
          identityProviderCode: 'PROVIDER_FOR_ADMIN',
          audience: PIX_ADMIN.AUDIENCE,
        });

        // then
        expect(service.code).to.equal('PROVIDER_FOR_ADMIN');
      });
    });

    describe('when audience is not provided', function () {
      it('returns a ready OIDC Provider for Pix App', function () {
        // given
        const identityProviderCode = 'FIRST';
        const firstOidcProviderService = {
          code: identityProviderCode,
          isReady: true,
        };
        const secondOidcProviderService = {
          code: 'SECOND',
        };

        oidcAuthenticationServiceRegistry.loadOidcProviderServices([
          firstOidcProviderService,
          secondOidcProviderService,
        ]);

        // when
        const service = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({ identityProviderCode });

        // then
        expect(service.code).to.equal('FIRST');
      });
    });

    it('throws an error when identity provider is not supported', function () {
      // given
      const identityProviderCode = 'UNSUPPORTED_OIDC_PROVIDER';
      const firstOidcProviderService = {
        code: 'FIRST',
        isReady: true,
      };
      const secondOidcProviderService = {
        code: 'SECOND',
      };

      oidcAuthenticationServiceRegistry.loadOidcProviderServices([firstOidcProviderService, secondOidcProviderService]);

      // when
      const error = catchErrSync(
        oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode,
        oidcAuthenticationServiceRegistry,
      )({ identityProviderCode });

      // then
      expect(error).to.be.an.instanceOf(InvalidIdentityProviderError);
      expect(error.message).to.equal(`Identity provider ${identityProviderCode} is not supported.`);
    });
  });

  describe('#loadOidcProviderServices', function () {
    it('loads all given oidc provider services and filters them', function () {
      // given
      const oidcProviderServices = [
        { code: 'ONE' },
        { code: 'OIDC', isReady: true },
        { code: 'OIDC_FOR_PIX_ADMIN', isReadyForPixAdmin: true },
      ];

      // when
      oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

      // then
      const allOidcProviderServices = oidcAuthenticationServiceRegistry.getAllOidcProviderServices();
      const readyOidcProviderServices = oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();
      const readyOidcProviderServicesForPixAdmin =
        oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();

      expect(allOidcProviderServices).to.have.lengthOf(3);

      expect(readyOidcProviderServices).to.have.lengthOf(1);
      expect(readyOidcProviderServices.map((service) => service.code)).to.contain('OIDC');

      expect(readyOidcProviderServicesForPixAdmin).to.have.lengthOf(1);
      expect(readyOidcProviderServicesForPixAdmin.map((service) => service.code)).to.contain('OIDC_FOR_PIX_ADMIN');
    });
  });

  describe('#configureReadyOidcProviderServices', function () {
    it('configures openid client for ready oidc provider services', async function () {
      // given
      const createClient = sinon.stub().resolves();
      const oidcProviderServices = [
        {
          code: 'OIDC',
          isReady: true,
          createClient,
        },
      ];
      oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

      // when
      await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServices();

      // then
      expect(createClient).to.have.been.calledOnce;
    });

    it('configures openid client for ready oidc provider services for Pix Admin', async function () {
      // given
      const createClient = sinon.stub().resolves();
      const oidcProviderServices = [
        {
          code: 'OIDC',
          isReadyForPixAdmin: true,
          createClient,
        },
      ];
      oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

      // when
      await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServices();

      // then
      expect(createClient).to.have.been.calledOnce;
    });
  });
});
