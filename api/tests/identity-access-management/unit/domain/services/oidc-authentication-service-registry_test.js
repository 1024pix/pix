import { OidcAuthenticationServiceRegistry } from '../../../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import { RequestedApplication } from '../../../../../src/identity-access-management/infrastructure/utils/network.js';
import { InvalidIdentityProviderError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Services | oidc-authentication-service-registry', function () {
  describe('getAllOidcProviderServices', function () {
    it('returns all the OidcAuthenticationServices, enabled or not', async function () {
      // given
      const oidcProviderServices = [{ code: 'NOT_ENABLED_OP' }, { code: 'ENABLED_OP', enabled: true }];
      const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();
      oidcAuthenticationServiceRegistry.testOnly_reset(oidcProviderServices);

      // when
      const result = await oidcAuthenticationServiceRegistry.getAllOidcProviderServices();

      // then
      expect(result).to.have.lengthOf(2);
      expect(result[0].code).to.eql('NOT_ENABLED_OP');
      expect(result[1].code).to.eql('ENABLED_OP');
    });
  });

  describe('getOidcProviderServicesByRequestedApplication', function () {
    it('returns the enabled OidcAuthenticationServices for a given requestedApplication', async function () {
      // given
      const oidcProviderServices = [
        { code: 'NOT_ENABLED_OP', application: 'app', applicationTld: '.org' },
        {
          code: 'ENABLED_OP',
          isEnabled: true,
          application: 'app',
          applicationTld: '.org',
        },
        {
          code: 'ENABLED_OP_FOR_ANOTHER_APP',
          isEnabled: true,
          application: 'orga',
          applicationTld: '.org',
        },
      ];
      const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();
      oidcAuthenticationServiceRegistry.testOnly_reset(oidcProviderServices);

      // when
      const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });
      const result =
        await oidcAuthenticationServiceRegistry.getOidcProviderServicesByRequestedApplication(requestedApplication);

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0].code).to.eql('ENABLED_OP');
    });
  });

  describe('getOidcProviderServiceByCode', function () {
    context('when there is no OidcAuthenticationService with the given code', function () {
      it('throws an InvalidIdentityProviderError', async function () {
        // given
        const oidcProviderServices = [];
        const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();
        oidcAuthenticationServiceRegistry.testOnly_reset(oidcProviderServices);

        // when
        const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });
        const promise = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
          identityProviderCode: 'ENABLED_OP',
          requestedApplication,
        });

        // then
        return expect(promise).to.be.rejectedWith(
          InvalidIdentityProviderError,
          'Identity provider ENABLED_OP not available.',
        );
      });
    });

    context(
      'when there is an OidcAuthenticationService with the given code but not for the given requestedApplication',
      function () {
        it('throws an InvalidIdentityProviderError', async function () {
          // given
          const oidcProviderServices = [
            {
              code: 'ENABLED_OP_FOR_ANOTHER_APP',
              isEnabled: true,
              application: 'orga',
              applicationTld: '.org',
              initializeClientConfig: async () => {
                return Promise.resolve();
              },
            },
          ];
          const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();
          oidcAuthenticationServiceRegistry.testOnly_reset(oidcProviderServices);

          // when
          const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });
          const promise = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
            identityProviderCode: 'ENABLED_OP',
            requestedApplication,
          });

          // then
          return expect(promise).to.be.rejectedWith(
            InvalidIdentityProviderError,
            'Identity provider ENABLED_OP not available.',
          );
        });
      },
    );

    context('when oidcProviderService.initializeClientConfig() throws an error', function () {
      it('lets the error bubble up', async function () {
        // given
        const oidcProviderServices = [
          {
            code: 'ENABLED_OP',
            isEnabled: true,
            application: 'app',
            applicationTld: '.org',
            initializeClientConfig: async () => {
              return Promise.reject(new Error('Some error during initializeClientConfig'));
            },
          },
        ];
        const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();
        oidcAuthenticationServiceRegistry.testOnly_reset(oidcProviderServices);

        // when
        const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });
        const promise = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
          identityProviderCode: 'ENABLED_OP',
          requestedApplication,
        });

        // then
        return expect(promise).to.be.rejectedWith(Error, 'Some error during initializeClientConfig');
      });
    });

    it('lazy-configures, caches and returns the OidcAuthenticationService for a given code and requestedApplication', async function () {
      // given
      const oidcProviderServices = [
        {
          code: 'NOT_ENABLED_OP',
          application: 'app',
          applicationTld: '.org',
          initializeClientConfig: async () => {
            return Promise.resolve();
          },
        },
        {
          code: 'ENABLED_OP',
          isEnabled: true,
          application: 'app',
          applicationTld: '.org',
          initializeClientConfig: async () => {
            return Promise.resolve();
          },
        },
        {
          code: 'ENABLED_OP_FOR_ANOTHER_APP',
          isEnabled: true,
          application: 'orga',
          applicationTld: '.org',
          initializeClientConfig: async () => {
            return Promise.resolve();
          },
        },
      ];
      const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry();
      oidcAuthenticationServiceRegistry.testOnly_reset(oidcProviderServices);

      // when
      const requestedApplication = new RequestedApplication({ applicationName: 'app', applicationTld: '.org' });
      const result = await oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
        identityProviderCode: 'ENABLED_OP',
        requestedApplication,
      });

      // then
      expect(result.code).to.eql('ENABLED_OP');
    });
  });
});
