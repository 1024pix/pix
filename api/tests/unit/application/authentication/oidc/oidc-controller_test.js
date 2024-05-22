import { oidcController } from '../../../../../lib/application/authentication/oidc/oidc-controller.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Authentication | OIDC', function () {
  const identityProvider = 'OIDC';
  let oidcAuthenticationServiceRegistryStub;

  beforeEach(function () {
    oidcAuthenticationServiceRegistryStub = {
      loadOidcProviderServices: sinon.stub(),
      configureReadyOidcProviderServiceByCode: sinon.stub().resolves(),
      getOidcProviderServiceByCode: sinon.stub(),
    };
  });

  describe('#reconcileUser', function () {
    it('should call use case and return the result', async function () {
      // given
      const request = {
        deserializedPayload: {
          identityProvider: 'OIDC',
          authenticationKey: '123abc',
        },
      };

      const dependencies = {
        oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
      };
      sinon.stub(usecases, 'reconcileOidcUser').resolves({
        accessToken: 'accessToken',
        logoutUrlUUID: 'logoutUrlUUID',
      });

      // when
      const result = await oidcController.reconcileUser(request, hFake, dependencies);

      // then
      expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
      expect(
        oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
      ).to.have.been.calledWithExactly(identityProvider);
      expect(result.source).to.deep.equal({ access_token: 'accessToken', logout_url_uuid: 'logoutUrlUUID' });
    });
  });

  describe('#reconcileUserForAdmin', function () {
    it('calls use case and return the result', async function () {
      // given
      const request = {
        deserializedPayload: {
          identityProvider: 'OIDC',
          authenticationKey: '123abc',
          email: 'user@example.net',
        },
      };

      const dependencies = {
        oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
      };
      sinon.stub(usecases, 'reconcileOidcUserForAdmin').resolves('accessToken');

      // when
      const result = await oidcController.reconcileUserForAdmin(request, hFake, dependencies);

      // then
      expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
      expect(
        oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
      ).to.have.been.calledWithExactly(identityProvider);
      expect(result.source).to.deep.equal({ access_token: 'accessToken' });
    });
  });
});
