import { BadRequestError, UnauthorizedError } from '../../../../lib/application/http-errors.js';
import { oidcProviderController } from '../../../../src/identity-access-management/application/oidc-provider/oidc-provider.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | oidc-provider', function () {
  describe('#authenticateOidcUser', function () {
    const code = 'ABCD';
    const state = 'state';
    const identityProviderState = 'identityProviderState';
    const nonce = 'nonce';
    const identityProvider = 'OIDC_EXAMPLE_NET';
    const pixAccessToken = 'pixAccessToken';

    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 123 } },
        deserializedPayload: {
          identityProvider,
          code,
          state: identityProviderState,
        },
        yar: { get: sinon.stub(), commit: sinon.stub() },
      };

      sinon.stub(usecases, 'authenticateOidcUser');
    });

    it('authenticates the user with payload parameters', async function () {
      // given
      usecases.authenticateOidcUser.resolves({
        pixAccessToken,
        logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
        isAuthenticationComplete: true,
      });

      request.yar.get.onCall(0).returns(state);
      request.yar.get.onCall(1).returns(nonce);

      // when
      await oidcProviderController.authenticateOidcUser(request, hFake);

      // then
      expect(usecases.authenticateOidcUser).to.have.been.calledWithExactly({
        audience: undefined,
        code,
        identityProviderCode: identityProvider,
        nonce: 'nonce',
        sessionState: state,
        state: identityProviderState,
      });
      expect(request.yar.commit).to.have.been.calledOnce;
    });

    context('when state cookie is missing', function () {
      it('returns a BadRequestError', async function () {
        // given
        request.yar.get.returns(null);

        // when
        const error = await catchErr(oidcProviderController.authenticateOidcUser)(request, hFake);

        // then
        expect(error).to.be.an.instanceOf(BadRequestError);
        expect(error.message).to.equal('Required cookie "state" is missing');
      });
    });

    context('when authentication is complete', function () {
      it('returns PIX access token and logout url uuid', async function () {
        // given
        usecases.authenticateOidcUser.resolves({
          pixAccessToken,
          logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
          isAuthenticationComplete: true,
        });

        // when
        const response = await oidcProviderController.authenticateOidcUser(request, hFake);

        // then
        const expectedResult = {
          access_token: pixAccessToken,
          logout_url_uuid: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
        };
        expect(response.source).to.deep.equal(expectedResult);
      });
    });

    context('when pix access token does not exist', function () {
      it('returns UnauthorizedError', async function () {
        // given
        const authenticationKey = 'aaa-bbb-ccc';
        const givenName = 'Mélusine';
        const familyName = 'TITEGOUTTE';
        const email = 'melu@example.net';
        usecases.authenticateOidcUser.resolves({ authenticationKey, givenName, familyName, email });

        // when
        const error = await catchErr(oidcProviderController.authenticateOidcUser)(request, hFake);

        // then
        expect(error).to.be.an.instanceOf(UnauthorizedError);
        expect(error.message).to.equal("L'utilisateur n'a pas de compte Pix");
        expect(error.code).to.equal('SHOULD_VALIDATE_CGU');
        expect(error.meta).to.deep.equal({ authenticationKey, givenName, familyName, email });
      });
    });
  });

  describe('#createUser', function () {
    it('creates an oidc user and returns access token and logout url UUID', async function () {
      // given
      const request = {
        deserializedPayload: { identityProvider: 'OIDC', authenticationKey: 'abcde' },
        state: {
          locale: 'fr-FR',
        },
      };
      const accessToken = 'access.token';
      const logoutUrlUUID = '00000000-0000-0000-0000-000000000000';

      sinon.stub(usecases, 'createOidcUser').resolves({ accessToken, logoutUrlUUID });

      // when
      const response = await oidcProviderController.createUser(request, hFake);

      // then
      expect(usecases.createOidcUser).to.have.been.calledWithExactly({
        identityProvider: 'OIDC',
        authenticationKey: 'abcde',
        localeFromCookie: 'fr-FR',
      });
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal({
        access_token: 'access.token',
        logout_url_uuid: '00000000-0000-0000-0000-000000000000',
      });
    });
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
      const result = await oidcProviderController.findUserForReconciliation(request, hFake, dependencies);

      // then
      expect(result.source).to.deep.equal({
        'full-name-from-pix': 'Sarah Pix',
        'full-name-from-external-identity-provider': 'Sarah Idp',
        'authentication-methods': [pixAuthenticationMethod],
      });
    });
  });

  describe('#getAuthorizationUrl', function () {
    it('returns the generated authorization url', async function () {
      // given
      const request = {
        query: { identity_provider: 'OIDC' },
        yar: { set: sinon.stub(), commit: sinon.stub() },
      };
      sinon.stub(usecases, 'getAuthorizationUrl').resolves({
        nonce: 'cf5d60f7-f0dc-4d9f-a9e5-11b5eebe5fda',
        state: '0498cd9d-7af3-474d-bde2-946f747ce46d',
        redirectTarget: 'https://idp.net/oidc/authorization',
      });

      // when
      const response = await oidcProviderController.getAuthorizationUrl(request, hFake);

      //then
      expect(usecases.getAuthorizationUrl).to.have.been.calledWithExactly({
        audience: undefined,
        identityProvider: 'OIDC',
      });
      expect(request.yar.set).to.have.been.calledTwice;
      expect(request.yar.set.getCall(0)).to.have.been.calledWithExactly(
        'state',
        '0498cd9d-7af3-474d-bde2-946f747ce46d',
      );
      expect(request.yar.set.getCall(1)).to.have.been.calledWithExactly(
        'nonce',
        'cf5d60f7-f0dc-4d9f-a9e5-11b5eebe5fda',
      );
      expect(request.yar.commit).to.have.been.calledOnce;
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal({
        redirectTarget: 'https://idp.net/oidc/authorization',
      });
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
          shouldCloseSession: false,
        },
      ]);

      // when
      const response = await oidcProviderController.getIdentityProviders({ query: { audience: null } }, hFake);

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
          'should-close-session': false,
        },
      });
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    it('calls the oidc authentication service retrieved from his code to generate the redirect logout url', async function () {
      // given
      const request = {
        auth: { credentials: { userId: '123' } },
        query: {
          identity_provider: 'OIDC',
          logout_url_uuid: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
        },
      };

      sinon.stub(usecases, 'getRedirectLogoutUrl').resolves('https://idp.net/oidc/logout?id_token_hint=ID_TOKEN');

      // when
      const response = await oidcProviderController.getRedirectLogoutUrl(request, hFake);

      // then
      expect(usecases.getRedirectLogoutUrl).to.have.been.calledWithExactly({
        identityProvider: 'OIDC',
        logoutUrlUUID: '1f3dbb71-f399-4c1c-85ae-0a863c78aeea',
        userId: '123',
      });
      expect(response.statusCode).to.equal(200);
      expect(response.source).to.deep.equal({
        redirectLogoutUrl: 'https://idp.net/oidc/logout?id_token_hint=ID_TOKEN',
      });
    });
  });

  describe('#reconcileUser', function () {
    it('calls use case and return the result', async function () {
      // given
      const identityProvider = 'OIDC';
      const oidcAuthenticationServiceRegistryStub = {
        loadOidcProviderServices: sinon.stub(),
        configureReadyOidcProviderServiceByCode: sinon.stub().resolves(),
        getOidcProviderServiceByCode: sinon.stub(),
      };
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
      const result = await oidcProviderController.reconcileUser(request, hFake, dependencies);

      // then
      expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
      expect(
        oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
      ).to.have.been.calledWithExactly(identityProvider);
      expect(result.source).to.deep.equal({ access_token: 'accessToken', logout_url_uuid: 'logoutUrlUUID' });
    });
  });
});
