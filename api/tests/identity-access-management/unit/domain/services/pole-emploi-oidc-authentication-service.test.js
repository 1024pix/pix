import sinon from 'sinon';

import { AuthenticationMethod } from '../../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../../src/identity-access-management/domain/services/pole-emploi-oidc-authentication-service.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { expect } from '../../../../test-helper.js';
import { createOpenIdClientMock } from '../../../../tooling/mocks/openid-client.mock.js';

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
            ...settings.oidcExampleNet,
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
      sinon.stub(settings, 'poleEmploi').value(settings.oidcExampleNet);

      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService(
        {
          ...settings.oidcExampleNet,
          additionalRequiredProperties: { logoutUrl: '', afterLogoutUrl: '', sendingUrl: '' },
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

  describe('#createAuthenticationComplement', function () {
    it('should create pole emploi authentication complement', function () {
      // given
      const sessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService(
        {
          ...settings.oidcExampleNet,
          additionalRequiredProperties: { logoutUrl: '', afterLogoutUrl: '', sendingUrl: '' },
          identityProvider: 'POLE_EMPLOI',
          organizationName: 'France Travail',
          shouldCloseSession: true,
          slug: 'pole-emploi',
          source: 'pole_emploi_connect',
        },
        { openidClient },
      );

      // when
      const result = poleEmploiOidcAuthenticationService.createAuthenticationComplement({ sessionContent });

      // then
      expect(result).to.be.instanceOf(AuthenticationMethod.PoleEmploiOidcAuthenticationComplement);
    });
  });
});
