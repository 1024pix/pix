import { oidcProviderController } from '../../../../src/identity-access-management/application/oidc-provider/oidc-provider.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { RequestedApplication } from '../../../../src/identity-access-management/infrastructure/utils/network.js';
import { BadRequestError, UnauthorizedError } from '../../../../src/shared/application/http-errors.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | oidc-provider', function () {
  describe('#authenticateOidcUser', function () {
    const code = 'ABCD';
    const state = 'state';
    const identityProviderState = 'identityProviderState';
    const nonce = 'nonce';
    const iss = 'https://issuer.url';
    const identityProvider = 'OIDC_EXAMPLE_NET';
    const pixAccessToken = 'pixAccessToken';
    const audience = 'https://app.pix.fr';
    const requestedApplication = new RequestedApplication('app');

    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 123 } },
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
        deserializedPayload: {
          identityProvider,
          code,
          state: identityProviderState,
          iss,
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
        code,
        identityProviderCode: identityProvider,
        nonce: 'nonce',
        sessionState: state,
        state: identityProviderState,
        iss,
        audience,
        requestedApplication,
      });
      expect(request.yar.commit).to.have.been.calledOnce;
    });

    context('when state is missing in session', function () {
      it('returns a BadRequestError', async function () {
        // given
        request.yar.get.returns(null);

        // when
        const error = await catchErr(oidcProviderController.authenticateOidcUser)(request, hFake);

        // then
        expect(error).to.be.an.instanceOf(BadRequestError);
        expect(error.code).to.equal('MISSING_OIDC_STATE');
        expect(error.message).to.equal('Required "state" is missing in session');
      });
    });

    context('when pix access token does not exist', function () {
      it('returns UnauthorizedError', async function () {
        // given
        const authenticationKey = 'aaa-bbb-ccc';
        const firstName = 'Mélusine';
        const lastName = 'TITEGOUTTE';
        const email = 'melu@example.net';
        const userClaims = {
          firstName,
          lastName,
          email,
        };
        usecases.authenticateOidcUser.resolves({
          authenticationKey,
          userClaims,
          givenName: firstName,
          familyName: lastName,
        });

        // when
        const error = await catchErr(oidcProviderController.authenticateOidcUser)(request, hFake);

        // then
        expect(error).to.be.an.instanceOf(UnauthorizedError);
        expect(error.code).to.equal('SHOULD_VALIDATE_CGU');
        expect(error.meta).to.deep.equal({
          authenticationKey,
          userClaims,
          givenName: firstName,
          familyName: lastName,
        });
      });
    });
  });

  describe('#createUser', function () {
    it('creates an oidc user and returns access token and logout url UUID', async function () {
      // given
      const request = {
        deserializedPayload: { identityProvider: 'OIDC', authenticationKey: 'abcde' },
        headers: {
          'accept-language': 'fr',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
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
        locale: 'fr-FR',
        language: 'fr',
        audience: 'https://app.pix.fr',
        requestedApplication: new RequestedApplication('app'),
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
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
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
        identityProvider: 'OIDC',
        requestedApplication: new RequestedApplication('app'),
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
    describe('when an unexpected error occurs', function () {
      it('returns an empty array', async function () {
        // given
        const request = {
          headers: {
            'accept-language': 'fr',
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'app.pix.fr',
          },
        };

        const error = new Error('BOOM!');
        sinon.stub(usecases, 'getReadyIdentityProviders').rejects(error);
        sinon.stub(logger, 'error');

        // when
        const response = await oidcProviderController.getIdentityProviders(request, hFake);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.source).to.deep.equal({ data: [] });
        expect(logger.error).to.have.been.calledWith(error, 'Error getting identity providers.');
      });
    });
  });

  describe('#reconcileUser', function () {
    it('calls use case and return the result', async function () {
      // given
      const request = {
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
        deserializedPayload: {
          identityProvider: 'OIDC',
          authenticationKey: '123abc',
        },
      };
      const requestedApplication = new RequestedApplication('app');

      sinon.stub(usecases, 'reconcileOidcUser').resolves({
        accessToken: 'accessToken',
        logoutUrlUUID: 'logoutUrlUUID',
      });

      // when
      const result = await oidcProviderController.reconcileUser(request, hFake);

      // then
      expect(usecases.reconcileOidcUser).to.have.been.calledWithExactly({
        authenticationKey: '123abc',
        identityProvider: 'OIDC',
        audience: 'https://app.pix.fr',
        requestedApplication,
      });
      expect(result.source).to.deep.equal({ access_token: 'accessToken', logout_url_uuid: 'logoutUrlUUID' });
    });
  });
});
