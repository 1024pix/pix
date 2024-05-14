import { oidcController } from '../../../../../lib/application/authentication/oidc/oidc-controller.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

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

  describe('#findUserForReconciliation', function () {
    it('calls the use case and serialize the result', async function () {
      // given
      const pixAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword();
      const email = 'eva.poree@example.net';
      const password = '123pix';
      const identityProvider = 'OIDC';
      const authenticationKey = '123abc';
      const request = {
        deserializedPayload: {
          identityProvider,
          email,
          password,
          authenticationKey,
        },
      };

      const serializerStub = {
        serialize: sinon.stub(),
      };

      serializerStub.serialize.returns({
        'full-name-from-pix': 'Sarah Pix',
        'full-name-from-external-identity-provider': 'Sarah Idp',
        'authentication-methods': [pixAuthenticationMethod],
      });

      const dependencies = {
        oidcSerializer: serializerStub,
      };
      sinon.stub(usecases, 'findUserForOidcReconciliation').resolves({
        firstName: 'sarah',
        lastName: 'croche',
        authenticationMethods: [pixAuthenticationMethod],
      });

      // when
      const result = await oidcController.findUserForReconciliation(request, hFake, dependencies);

      // then
      expect(result.source).to.deep.equal({
        'full-name-from-pix': 'Sarah Pix',
        'full-name-from-external-identity-provider': 'Sarah Idp',
        'authentication-methods': [pixAuthenticationMethod],
      });
    });
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
