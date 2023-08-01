import { sinon, expect, hFake, catchErr, domainBuilder } from '../../../../test-helper.js';
import { oidcController } from '../../../../../lib/application/authentication/oidc/oidc-controller.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { UnauthorizedError } from '../../../../../lib/application/http-errors.js';

describe('Unit | Application | Controller | Authentication | OIDC', function () {
  const identityProvider = 'OIDC';

  describe('#getAllIdentityProvidersForAdmin', function () {
    it('returns the list of oidc identity providers', async function () {
      // given
      sinon.stub(usecases, 'getAllIdentityProviders').returns([
        {
          code: 'LIMONADE_OIDC_PROVIDER',
          source: 'limonade_oidc_provider',
          organizationName: 'Limonade OIDC Provider',
          slug: 'limonade-oidc-provider',
          hasLogoutUrl: false,
        },
        {
          code: 'KOMBUCHA_OIDC_PROVIDER',
          source: 'kombucha_oidc_provider',
          organizationName: 'Kombucha OIDC Provider',
          slug: 'kombucha-oidc-provider',
          hasLogoutUrl: true,
        },
      ]);

      // when
      const response = await oidcController.getAllIdentityProvidersForAdmin(null, hFake);

      // then
      expect(usecases.getAllIdentityProviders).to.have.been.called;
      expect(response.statusCode).to.equal(200);
      expect(response.source.data.length).to.equal(2);
      expect(response.source.data).to.deep.equal([
        {
          type: 'oidc-identity-providers',
          id: 'limonade-oidc-provider',
          attributes: {
            code: 'LIMONADE_OIDC_PROVIDER',
            'organization-name': 'Limonade OIDC Provider',
            'use-end-session': false,
            'has-logout-url': false,
            source: 'limonade_oidc_provider',
          },
        },
        {
          type: 'oidc-identity-providers',
          id: 'kombucha-oidc-provider',
          attributes: {
            code: 'KOMBUCHA_OIDC_PROVIDER',
            'organization-name': 'Kombucha OIDC Provider',
            'use-end-session': false,
            'has-logout-url': true,
            source: 'kombucha_oidc_provider',
          },
        },
      ]);
    });
  });

  describe('#getIdentityProviders', function () {
    it('returns the list of oidc identity providers', async function () {
      // given
      sinon.stub(usecases, 'getReadyIdentityProviders').returns([
        {
          code: 'SOME_OIDC_PROVIDER',
          source: 'some_oidc_provider',
          organizationName: 'Some OIDC Provider',
          slug: 'some-oidc-provider',
          hasLogoutUrl: false,
        },
      ]);

      // when
      const response = await oidcController.getIdentityProviders(null, hFake);

      // then
      expect(usecases.getReadyIdentityProviders).to.have.been.called;
      expect(response.statusCode).to.equal(200);
      expect(response.source.data.length).to.equal(1);
      expect(response.source.data).to.deep.contain({
        type: 'oidc-identity-providers',
        id: 'some-oidc-provider',
        attributes: {
          code: 'SOME_OIDC_PROVIDER',
          source: 'some_oidc_provider',
          'organization-name': 'Some OIDC Provider',
          'use-end-session': false,
          'has-logout-url': false,
        },
      });
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    context('when identity provider is POLE_EMPLOI', function () {
      it('should call pole emploi authentication service to generate the redirect logout url', async function () {
        // given
        const request = {
          auth: { credentials: { userId: '123' } },
          query: {
            identity_provider: identityProvider,
            redirect_uri: 'http://example.net/',
            logout_url_uuid: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
          },
        };
        const oidcAuthenticationService = {
          getRedirectLogoutUrl: sinon.stub(),
        };

        const authenticationServiceRegistryStub = {
          getOidcProviderServiceByCode: sinon.stub(),
        };

        authenticationServiceRegistryStub.getOidcProviderServiceByCode
          .withArgs(identityProvider)
          .returns(oidcAuthenticationService);

        const dependencies = {
          authenticationServiceRegistry: authenticationServiceRegistryStub,
        };

        // when
        await oidcController.getRedirectLogoutUrl(request, hFake, dependencies);

        // then
        expect(oidcAuthenticationService.getRedirectLogoutUrl).to.have.been.calledWithExactly({
          userId: '123',
          logoutUrlUUID: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
        });
      });
    });
  });

  describe('#getAuthenticationUrl', function () {
    it('should call oidc authentication service to generate url', async function () {
      // given
      const request = { query: { identity_provider: identityProvider, redirect_uri: 'http:/exemple.net/' } };
      const getAuthenticationUrlStub = sinon.stub();
      const oidcAuthenticationService = {
        getAuthenticationUrl: getAuthenticationUrlStub,
      };
      const authenticationServiceRegistryStub = {
        getOidcProviderServiceByCode: sinon.stub(),
      };

      authenticationServiceRegistryStub.getOidcProviderServiceByCode
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);

      const dependencies = {
        authenticationServiceRegistry: authenticationServiceRegistryStub,
      };
      getAuthenticationUrlStub.returns('an authentication url');

      // when
      await oidcController.getAuthenticationUrl(request, hFake, dependencies);

      //then
      expect(oidcAuthenticationService.getAuthenticationUrl).to.have.been.calledWithExactly({
        redirectUri: 'http:/exemple.net/',
      });
    });
  });

  describe('#authenticateUser', function () {
    const code = 'ABCD';
    const redirectUri = 'http://redirectUri.fr';
    const stateSent = 'state';
    const stateReceived = 'state';

    const pixAccessToken = 'pixAccessToken';

    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 123 } },
        deserializedPayload: {
          identityProvider,
          code,
          redirectUri,
          stateSent,
          stateReceived,
        },
      };

      sinon.stub(usecases, 'authenticateOidcUser');
    });

    it('should authenticate the user with payload parameters', async function () {
      // given
      const oidcAuthenticationService = {};
      const authenticationServiceRegistryStub = {
        getOidcProviderServiceByCode: sinon.stub(),
      };

      authenticationServiceRegistryStub.getOidcProviderServiceByCode
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);

      const dependencies = {
        authenticationServiceRegistry: authenticationServiceRegistryStub,
      };

      usecases.authenticateOidcUser.resolves({
        pixAccessToken,
        logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
        isAuthenticationComplete: true,
      });

      // when
      await oidcController.authenticateUser(request, hFake, dependencies);

      // then
      expect(usecases.authenticateOidcUser).to.have.been.calledWithExactly({
        code,
        redirectUri,
        stateReceived,
        stateSent,
        oidcAuthenticationService,
      });
    });

    it('should return PIX access token and logout url uuid when authentication is complete', async function () {
      // given
      const oidcAuthenticationService = {};
      const authenticationServiceRegistryStub = {
        getOidcProviderServiceByCode: sinon.stub(),
      };

      authenticationServiceRegistryStub.getOidcProviderServiceByCode
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);

      const dependencies = {
        authenticationServiceRegistry: authenticationServiceRegistryStub,
      };
      usecases.authenticateOidcUser.resolves({
        pixAccessToken,
        logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
        isAuthenticationComplete: true,
      });

      // when
      const response = await oidcController.authenticateUser(request, hFake, dependencies);

      // then
      const expectedResult = {
        access_token: pixAccessToken,
        logout_url_uuid: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
      };
      expect(response.source).to.deep.equal(expectedResult);
    });

    it('should return UnauthorizedError if pix access token does not exist', async function () {
      // given
      const oidcAuthenticationService = {};
      const authenticationServiceRegistryStub = {
        getOidcProviderServiceByCode: sinon.stub(),
      };

      authenticationServiceRegistryStub.getOidcProviderServiceByCode
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);

      const dependencies = {
        authenticationServiceRegistry: authenticationServiceRegistryStub,
      };
      const authenticationKey = 'aaa-bbb-ccc';
      const givenName = 'Mélusine';
      const familyName = 'TITEGOUTTE';
      usecases.authenticateOidcUser.resolves({ authenticationKey, givenName, familyName });

      // when
      const error = await catchErr(oidcController.authenticateUser)(request, hFake, dependencies);

      // then
      expect(error).to.be.an.instanceOf(UnauthorizedError);
      expect(error.message).to.equal("L'utilisateur n'a pas de compte Pix");
      expect(error.code).to.equal('SHOULD_VALIDATE_CGU');
      expect(error.meta).to.deep.equal({ authenticationKey, givenName, familyName });
    });
  });

  describe('#createUser', function () {
    it('should create oidc user and return access token and logout url UUID', async function () {
      // given
      const request = {
        deserializedPayload: { identityProvider, authenticationKey: 'abcde' },
        state: {
          locale: 'fr-FR',
        },
      };
      const accessToken = 'access.token';
      const oidcAuthenticationService = {};
      const authenticationServiceRegistryStub = {
        getOidcProviderServiceByCode: sinon.stub(),
      };

      authenticationServiceRegistryStub.getOidcProviderServiceByCode
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);

      const dependencies = {
        authenticationServiceRegistry: authenticationServiceRegistryStub,
      };
      sinon
        .stub(usecases, 'createOidcUser')
        .withArgs({
          authenticationKey: 'abcde',
          identityProvider,
          oidcAuthenticationService,
          localeFromCookie: 'fr-FR',
        })
        .resolves({ accessToken, logoutUrlUUID: 'logoutUrlUUID' });

      // when
      const result = await oidcController.createUser(request, hFake, dependencies);

      //then
      expect(result.source.access_token).to.equal(accessToken);
      expect(result.source.logout_url_uuid).to.equal('logoutUrlUUID');
    });
  });

  describe('#findUserForReconciliation', function () {
    it('should call the use case and serialize the result', async function () {
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
      const authenticationServiceRegistryStub = {
        getOidcProviderServiceByCode: sinon.stub(),
      };

      const dependencies = {
        authenticationServiceRegistry: authenticationServiceRegistryStub,
      };
      sinon.stub(usecases, 'reconcileOidcUser').resolves({
        accessToken: 'accessToken',
        logoutUrlUUID: 'logoutUrlUUID',
      });

      // when
      const result = await oidcController.reconcileUser(request, hFake, dependencies);

      // then
      expect(result.source).to.deep.equal({ access_token: 'accessToken', logout_url_uuid: 'logoutUrlUUID' });
    });
  });

  describe('#reconcileUserForAdmin', function () {
    it('should call use case and return the result', async function () {
      // given
      const request = {
        deserializedPayload: {
          identityProvider: 'OIDC',
          authenticationKey: '123abc',
          email: 'user@example.net',
        },
      };
      const authenticationServiceRegistryStub = {
        getOidcProviderServiceByCode: sinon.stub(),
      };

      const dependencies = {
        authenticationServiceRegistry: authenticationServiceRegistryStub,
      };
      sinon.stub(usecases, 'reconcileOidcUserForAdmin').resolves('accessToken');

      // when
      const result = await oidcController.reconcileUserForAdmin(request, hFake, dependencies);

      // then
      expect(result.source).to.deep.equal({ access_token: 'accessToken' });
    });
  });
});
