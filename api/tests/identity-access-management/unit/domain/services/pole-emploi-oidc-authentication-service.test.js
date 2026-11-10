import { expect } from 'chai';
import sinon from 'sinon';

import { config as settings } from '../../../../../config/config.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/pole-emploi-oidc-authentication-service.js';
import { createOpenIdClientMock, OIDC_PROVIDER_TEST_CONFIG } from '../../../../tooling/mocks/openid-client.mock.js';

describe('Unit | Identity Access Management | Domain | Services | pole-emploi-oidc-authentication-service', function () {
  let openidClient;

  beforeEach(function () {
    openidClient = createOpenIdClientMock();
  });

  describe('#constructor', function () {
    describe('when additionalRequiredProperties is not defined', function () {
      it('is disabled', async function () {
        // when
        const oidcAuthenticationService = new PoleEmploiOidcAuthenticationService(
          {
            ...OIDC_PROVIDER_TEST_CONFIG,
            identityProvider: 'POLE_EMPLOI',
            organizationName: 'France Travail',
            shouldCloseSession: true,
            slug: 'pole-emploi',
            source: 'pole_emploi_connect',
            enabled: false,
            enabledForPixAdmin: false,
          },
          { openidClient },
        );

        // then
        expect(oidcAuthenticationService.isEnabled).to.be.false;
      });
    });
  });

  describe('#initializeClientConfig', function () {
    it('creates an openid client config', async function () {
      // given
      sinon.stub(settings, 'poleEmploi').value(OIDC_PROVIDER_TEST_CONFIG);

      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService(
        {
          ...OIDC_PROVIDER_TEST_CONFIG,
          additionalRequiredProperties: { logoutUrl: '', afterLogoutUrl: '' },
          identityProvider: 'POLE_EMPLOI',
          organizationName: 'France Travail',
          shouldCloseSession: true,
          slug: 'pole-emploi',
          source: 'pole_emploi_connect',
        },
        { openidClient },
      );

      // when
      await poleEmploiOidcAuthenticationService.initializeClientConfig();

      // then
      expect(openidClient.discovery).to.have.been.calledWithExactly(
        new URL('https://oidc.example.net/.well-known/openid-configuration'),
        'client',
        { client_secret: 'secret' },
      );
    });
  });
});
