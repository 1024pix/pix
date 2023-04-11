const { sinon, expect, hFake, catchErr, domainBuilder } = require('../../../../test-helper');
const oidcController = require('../../../../../lib/application/authentication/oidc/oidc-controller');
const usecases = require('../../../../../lib/domain/usecases/index.js');
const { UnauthorizedError } = require('../../../../../lib/application/http-errors');

describe('Unit | Application | Controller | Authentication | OIDC', function () {
  const identityProvider = 'OIDC';

  describe('#getIdentityProviders', function () {
    it('should return the list of oidc identity providers', async function () {
      // given & when
      const response = await oidcController.getIdentityProviders(null, hFake);

      // then
      const expectedCnavProvider = {
        type: 'oidc-identity-providers',
        id: 'cnav',
        attributes: { code: 'CNAV', 'organization-name': 'CNAV', 'has-logout-url': false, source: 'cnav' },
      };
      expect(response.source.data).to.deep.contain(expectedCnavProvider);
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
        sinon
          .stub(authenticationServiceRegistry, 'lookupAuthenticationService')
          .withArgs(identityProvider)
          .returns(oidcAuthenticationService);

        // when
        await oidcController.getRedirectLogoutUrl(request, hFake);

        // then
        expect(authenticationServiceRegistry.lookupAuthenticationService).to.have.been.calledWith(identityProvider);
        expect(oidcAuthenticationService.getRedirectLogoutUrl).to.have.been.calledWith({
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
      sinon
        .stub(authenticationServiceRegistry, 'lookupAuthenticationService')
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);
      getAuthenticationUrlStub.returns('an authentication url');

      // when
      await oidcController.getAuthenticationUrl(request, hFake);

      //then
      expect(oidcAuthenticationService.getAuthenticationUrl).to.have.been.calledWith({
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
      sinon
        .stub(authenticationServiceRegistry, 'lookupAuthenticationService')
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);

      usecases.authenticateOidcUser.resolves({
        pixAccessToken,
        logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
        isAuthenticationComplete: true,
      });

      // when
      await oidcController.authenticateUser(request, hFake);

      // then
      expect(usecases.authenticateOidcUser).to.have.been.calledWith({
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
      sinon
        .stub(authenticationServiceRegistry, 'lookupAuthenticationService')
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);
      usecases.authenticateOidcUser.resolves({
        pixAccessToken,
        logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
        isAuthenticationComplete: true,
      });

      // when
      const response = await oidcController.authenticateUser(request, hFake);

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
      sinon
        .stub(authenticationServiceRegistry, 'lookupAuthenticationService')
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);
      const authenticationKey = 'aaa-bbb-ccc';
      const givenName = 'Mélusine';
      const familyName = 'TITEGOUTTE';
      usecases.authenticateOidcUser.resolves({ authenticationKey, givenName, familyName });

      // when
      const error = await catchErr(oidcController.authenticateUser)(request, hFake);

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
      sinon
        .stub(authenticationServiceRegistry, 'lookupAuthenticationService')
        .withArgs(identityProvider)
        .returns(oidcAuthenticationService);
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
      const result = await oidcController.createUser(request, hFake);

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
      sinon.stub(authenticationServiceRegistry, 'lookupAuthenticationService');
      sinon.stub(usecases, 'findUserForOidcReconciliation').resolves({
        firstName: 'sarah',
        lastName: 'croche',
        authenticationMethods: [pixAuthenticationMethod],
      });
      sinon.stub(oidcSerializer, 'serialize').returns({
        'full-name-from-pix': 'Sarah Pix',
        'full-name-from-external-identity-provider': 'Sarah Idp',
        'authentication-methods': [pixAuthenticationMethod],
      });

      // when
      const result = await oidcController.findUserForReconciliation(request, hFake);

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
      sinon.stub(authenticationServiceRegistry, 'lookupAuthenticationService');
      sinon.stub(usecases, 'reconcileOidcUser').resolves({
        accessToken: 'accessToken',
        logoutUrlUUID: 'logoutUrlUUID',
      });

      // when
      const result = await oidcController.reconcileUser(request, hFake);

      // then
      expect(result.source).to.deep.equal({ access_token: 'accessToken', logout_url_uuid: 'logoutUrlUUID' });
    });
  });
});
