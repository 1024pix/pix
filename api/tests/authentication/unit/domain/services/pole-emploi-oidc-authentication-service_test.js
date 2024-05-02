import { Issuer } from 'openid-client';

import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import { PoleEmploiOidcAuthenticationService } from '../../../../../src/authentication/domain/services/pole-emploi-oidc-authentication-service.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Authentication | Domain | Services | pole-emploi-oidc-authentication-service', function () {
  describe('#constructor', function () {
    describe('when additionalRequiredProperties is not defined', function () {
      it('is not ready', async function () {
        // when
        const oidcAuthenticationService = new PoleEmploiOidcAuthenticationService({
          ...settings.oidcExampleNet,
          openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
          identityProvider: 'POLE_EMPLOI',
          organizationName: 'France Travail',
          shouldCloseSession: true,
          slug: 'pole-emploi',
          source: 'pole_emploi_connect',
        });

        // then
        expect(oidcAuthenticationService.isReady).to.be.false;
      });
    });
  });

  describe('#createClient', function () {
    it('creates an openid client with extra metadata', async function () {
      // given
      const Client = sinon.spy();

      sinon.stub(Issuer, 'discover').resolves({ Client });
      sinon.stub(settings, 'poleEmploi').value(settings.oidcExampleNet);

      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService({
        ...settings.oidcExampleNet,
        additionalRequiredProperties: { logoutUrl: '', afterLogoutUrl: '', sendingUrl: '' },
        openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
        identityProvider: 'POLE_EMPLOI',
        organizationName: 'France Travail',
        shouldCloseSession: true,
        slug: 'pole-emploi',
        source: 'pole_emploi_connect',
      });

      // when
      await poleEmploiOidcAuthenticationService.createClient();

      // then
      expect(Issuer.discover).to.have.been.calledWithExactly(
        'https://oidc.example.net/.well-known/openid-configuration',
      );
      expect(Client).to.have.been.calledWithNew;
      expect(Client).to.have.been.calledWithExactly({
        client_id: 'client',
        client_secret: 'secret',
        redirect_uris: ['https://app.dev.pix.local/connexion/oidc-example-net'],
        token_endpoint_auth_method: 'client_secret_post',
      });
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
      const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService({
        ...settings.oidcExampleNet,
        additionalRequiredProperties: { logoutUrl: '', afterLogoutUrl: '', sendingUrl: '' },
        openidClientExtraMetadata: { token_endpoint_auth_method: 'client_secret_post' },
        identityProvider: 'POLE_EMPLOI',
        organizationName: 'France Travail',
        shouldCloseSession: true,
        slug: 'pole-emploi',
        source: 'pole_emploi_connect',
      });

      // when
      const result = poleEmploiOidcAuthenticationService.createAuthenticationComplement({ sessionContent });

      // then
      expect(result).to.be.instanceOf(AuthenticationMethod.PoleEmploiOidcAuthenticationComplement);
    });
  });
});
