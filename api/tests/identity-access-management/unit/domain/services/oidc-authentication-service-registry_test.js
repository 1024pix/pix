import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { OidcProvider } from '../../../../../src/identity-access-management/domain/models/OidcProvider.js';
import { CnfptOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/cnfpt-oidc-authentication-service.js';
import { FwbOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/fwb-oidc-authentication-service.js';
import { GoogleOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/google-oidc-authentication-service.js';
import { OidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service.js';
import { OidcAuthenticationServiceRegistry } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/pole-emploi-oidc-authentication-service.js';
import { oidcProviderRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import { InvalidIdentityProviderError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Services | oidc-authentication-service-registry', function () {
  let oidcAuthenticationServiceRegistry;

  beforeEach(function () {
    oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();
  });

  describe('#getAllOidcProviderServices', function () {
    it('returns all OIDC Providers', async function () {
      // given
      const firstOidcProviderService = {
        code: 'FIRST',
      };
      const secondOidcProviderService = {
        code: 'SECOND',
      };

      await oidcAuthenticationServiceRegistry.loadOidcProviderServices([
        firstOidcProviderService,
        secondOidcProviderService,
      ]);

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
    it('returns ready OIDC Providers', async function () {
      // given
      const firstOidcProviderService = {
        code: 'FIRST',
      };
      const secondOidcProviderService = {
        code: 'SECOND',
        isReady: true,
      };

      await oidcAuthenticationServiceRegistry.loadOidcProviderServices([
        firstOidcProviderService,
        secondOidcProviderService,
      ]);

      // when
      const services = oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();

      // then
      const serviceCodes = services.map((service) => service.code);
      expect(serviceCodes.length).to.equal(1);
      expect(serviceCodes).to.contain('SECOND');
    });
  });

  describe('#getReadyOidcProviderServicesForPixAdmin', function () {
    it('returns ready OIDC Providers for Pix Admin', async function () {
      // given
      const firstOidcProviderService = {
        code: 'FIRST',
        isReadyForPixAdmin: true,
      };
      const secondOidcProviderService = {
        code: 'SECOND',
      };

      await oidcAuthenticationServiceRegistry.loadOidcProviderServices([
        firstOidcProviderService,
        secondOidcProviderService,
      ]);

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
      it('returns a ready OIDC provider for Pix Admin', async function () {
        // given
        const oidcProviderForPixApp = {
          code: 'PROVIDER_FOR_APP',
          isReady: true,
        };
        const oidcProviderForPixAdmin = {
          code: 'PROVIDER_FOR_ADMIN',
          isReadyForPixAdmin: true,
        };

        await oidcAuthenticationServiceRegistry.loadOidcProviderServices([
          oidcProviderForPixApp,
          oidcProviderForPixAdmin,
        ]);

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
      it('returns a ready OIDC Provider for Pix App', async function () {
        // given
        const identityProviderCode = 'FIRST';
        const firstOidcProviderService = {
          code: identityProviderCode,
          isReady: true,
        };
        const secondOidcProviderService = {
          code: 'SECOND',
        };

        await oidcAuthenticationServiceRegistry.loadOidcProviderServices([
          firstOidcProviderService,
          secondOidcProviderService,
        ]);

        // when
        const service = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({ identityProviderCode });

        // then
        expect(service.code).to.equal('FIRST');
      });
    });

    it('throws an error when identity provider is not supported', async function () {
      // given
      const identityProviderCode = 'UNSUPPORTED_OIDC_PROVIDER';
      const firstOidcProviderService = {
        code: 'FIRST',
        isReady: true,
      };
      const secondOidcProviderService = {
        code: 'SECOND',
      };

      await oidcAuthenticationServiceRegistry.loadOidcProviderServices([
        firstOidcProviderService,
        secondOidcProviderService,
      ]);

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
    describe('when oidc provider services are already loaded', function () {
      it('returns undefined', async function () {
        // given
        sinon
          .stub(oidcProviderRepository, 'findAllOidcProviders')
          .resolves([{ code: 'ONE' }, { code: 'OIDC' }, { code: 'OIDC_FOR_PIX_ADMIN' }]);

        const oidcProviderServices = [
          { code: 'ONE' },
          { code: 'OIDC', isReady: true },
          { code: 'OIDC_FOR_PIX_ADMIN', isReadyForPixAdmin: true },
        ];
        await oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

        // when
        const result = await oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

        // then
        expect(result).to.be.undefined;
      });
    });

    describe('when oidc provider services are not loaded', function () {
      it('loads all given oidc provider services, filters them and returns true', async function () {
        // given
        const oidcProviderServices = [
          { code: 'ONE' },
          { code: 'OIDC', isReady: true },
          { code: 'OIDC_FOR_PIX_ADMIN', isReadyForPixAdmin: true },
        ];

        // when
        const result = await oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

        // then
        const allOidcProviderServices = oidcAuthenticationServiceRegistry.getAllOidcProviderServices();
        const readyOidcProviderServices = oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();
        const readyOidcProviderServicesForPixAdmin =
          oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();

        expect(result).to.be.true;
        expect(allOidcProviderServices).to.have.lengthOf(3);

        expect(readyOidcProviderServices).to.have.lengthOf(1);
        expect(readyOidcProviderServices.map((service) => service.code)).to.contain('OIDC');

        expect(readyOidcProviderServicesForPixAdmin).to.have.lengthOf(1);
        expect(readyOidcProviderServicesForPixAdmin.map((service) => service.code)).to.contain('OIDC_FOR_PIX_ADMIN');
      });
    });

    describe('when oidc provider services loads providers', function () {
      it('instantciates the correct OIDC authentication services', async function () {
        // given
        sinon
          .stub(oidcProviderRepository, 'findAllOidcProviders')
          .resolves([
            new OidcProvider({ identityProvider: 'GENERIC' }),
            new OidcProvider({ identityProvider: 'FWB' }),
            new OidcProvider({ identityProvider: 'GOOGLE' }),
            new OidcProvider({ identityProvider: 'POLE_EMPLOI' }),
            new OidcProvider({ identityProvider: 'CNFPT' }),
          ]);

        // when
        await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
        const services = oidcAuthenticationServiceRegistry.getAllOidcProviderServices();

        // then
        expect(services.length).to.be.equal(5);

        const genericService = services.find((service) => service.identityProvider === 'GENERIC');
        expect(genericService).not.to.be.empty;
        expect(genericService).to.be.instanceOf(OidcAuthenticationService);

        const fwbService = services.find((service) => service.identityProvider === 'FWB');
        expect(fwbService).not.to.be.empty;
        expect(fwbService).to.be.instanceOf(FwbOidcAuthenticationService);

        const googleService = services.find((service) => service.identityProvider === 'GOOGLE');
        expect(googleService).not.to.be.empty;
        expect(googleService).to.be.instanceOf(GoogleOidcAuthenticationService);

        const poleEmploiService = services.find((service) => service.identityProvider === 'POLE_EMPLOI');
        expect(poleEmploiService).not.to.be.empty;
        expect(poleEmploiService).to.be.instanceOf(PoleEmploiOidcAuthenticationService);

        const cnfptService = services.find((service) => service.identityProvider === 'CNFPT');
        expect(cnfptService).not.to.be.empty;
        expect(cnfptService).to.be.instanceOf(CnfptOidcAuthenticationService);
      });
    });
  });

  describe('#configureReadyOidcProviderServiceByCode', function () {
    context('when oidc provider service does not exist', function () {
      it('returns undefined', async function () {
        // when
        const result = await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode('OIDC');

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when oidc provider service exists and loaded', function () {
      it('configures openid client for ready oidc provider service and returns true', async function () {
        // given
        const createClient = sinon.stub().resolves();
        const oidcProviderServices = [
          {
            code: 'OIDC',
            isReady: true,
            createClient,
          },
        ];
        await oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

        // when
        const result = await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(
          oidcProviderServices[0].code,
        );

        // then
        expect(result).to.be.true;
        expect(createClient).to.have.been.calledOnce;
      });

      context('when there is already a client instantiated', function () {
        it('returns undefined', async function () {
          // given
          const oidcProviderServices = [
            {
              code: 'OIDC',
              isReady: true,
              client: {},
            },
          ];
          await oidcAuthenticationServiceRegistry.loadOidcProviderServices(oidcProviderServices);

          // when
          const result = await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode('OIDC');

          // then
          expect(result).to.be.undefined;
        });
      });
    });
  });
});
