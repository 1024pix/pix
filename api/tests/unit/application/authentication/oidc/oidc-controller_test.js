import { oidcController } from '../../../../../lib/application/authentication/oidc/oidc-controller.js';
import { BadRequestError, UnauthorizedError } from '../../../../../lib/application/http-errors.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

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

  describe('#authenticateUser', function () {
    const code = 'ABCD';
    const redirectUri = 'http://redirectUri.fr';
    const state = 'state';
    const identityProviderState = 'identityProviderState';
    const nonce = 'nonce';

    const pixAccessToken = 'pixAccessToken';

    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 123 } },
        deserializedPayload: {
          identityProvider,
          code,
          redirectUri,
          state: identityProviderState,
        },
        yar: { get: sinon.stub(), commit: sinon.stub() },
      };

      sinon.stub(usecases, 'authenticateOidcUser');
    });

    it('authenticates the user with payload parameters', async function () {
      // given
      const oidcAuthenticationService = {};

      oidcAuthenticationServiceRegistryStub.getOidcProviderServiceByCode
        .withArgs({ identityProviderCode: identityProvider, audience: undefined })
        .returns(oidcAuthenticationService);

      const dependencies = {
        oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
      };

      usecases.authenticateOidcUser.resolves({
        pixAccessToken,
        logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
        isAuthenticationComplete: true,
      });

      request.yar.get.onCall(0).returns(state);
      request.yar.get.onCall(1).returns(nonce);

      // when
      await oidcController.authenticateUser(request, hFake, dependencies);

      // then
      expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
      expect(
        oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
      ).to.have.been.calledWithExactly(identityProvider);
      expect(usecases.authenticateOidcUser).to.have.been.calledWithExactly({
        audience: undefined,
        code,
        redirectUri,
        state: identityProviderState,
        sessionState: state,
        nonce: 'nonce',
        oidcAuthenticationService,
      });
      expect(request.yar.commit).to.have.been.calledOnce;
    });

    context('when audience is "admin"', function () {
      it('uses only identity providers enabled in Pix Admin', async function () {
        // given
        request = {
          ...request,
          deserializedPayload: {
            ...request.deserializedPayload,
            audience: PIX_ADMIN.AUDIENCE,
          },
        };
        const oidcAuthenticationService = {};

        oidcAuthenticationServiceRegistryStub.getOidcProviderServiceByCode
          .withArgs({ identityProviderCode: identityProvider })
          .returns(oidcAuthenticationService);

        const dependencies = {
          oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
        };

        usecases.authenticateOidcUser.resolves({
          pixAccessToken,
          logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
          isAuthenticationComplete: true,
        });

        request.yar.get.onCall(0).returns(state);
        request.yar.get.onCall(1).returns(nonce);

        // when
        await oidcController.authenticateUser(request, hFake, dependencies);

        // then
        expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
        expect(
          oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
        ).to.have.been.calledWithExactly(identityProvider);
        expect(oidcAuthenticationServiceRegistryStub.getOidcProviderServiceByCode).to.have.been.calledWithExactly({
          identityProviderCode: identityProvider,
          audience: PIX_ADMIN.AUDIENCE,
        });
      });
    });

    context('when state cookie is missing', function () {
      it('returns a BadRequestError', async function () {
        // given
        request.yar.get.returns(null);
        const dependencies = {};

        // when
        const error = await catchErr(oidcController.authenticateUser)(request, hFake, dependencies);

        // then
        expect(error).to.be.an.instanceOf(BadRequestError);
        expect(error.message).to.equal('Required cookie "state" is missing');
      });
    });

    context('when authentication is complete', function () {
      it('returns PIX access token and logout url uuid', async function () {
        // given
        const oidcAuthenticationService = {};

        oidcAuthenticationServiceRegistryStub.getOidcProviderServiceByCode
          .withArgs({ identityProviderCode: identityProvider })
          .returns(oidcAuthenticationService);

        const dependencies = {
          oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
        };
        usecases.authenticateOidcUser.resolves({
          pixAccessToken,
          logoutUrlUUID: '0208f50b-f612-46aa-89a0-7cdb5fb0d312',
          isAuthenticationComplete: true,
        });

        // when
        const response = await oidcController.authenticateUser(request, hFake, dependencies);

        // then
        expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
        expect(
          oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
        ).to.have.been.calledWithExactly(identityProvider);
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
        const oidcAuthenticationService = {};

        oidcAuthenticationServiceRegistryStub.getOidcProviderServiceByCode
          .withArgs({ identityProviderCode: identityProvider })
          .returns(oidcAuthenticationService);

        const dependencies = {
          oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
        };
        const authenticationKey = 'aaa-bbb-ccc';
        const givenName = 'Mélusine';
        const familyName = 'TITEGOUTTE';
        const email = 'melu@example.net';
        usecases.authenticateOidcUser.resolves({ authenticationKey, givenName, familyName, email });

        // when
        const error = await catchErr(oidcController.authenticateUser)(request, hFake, dependencies);

        // then
        expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
        expect(
          oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
        ).to.have.been.calledWithExactly(identityProvider);
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
        deserializedPayload: { identityProvider, authenticationKey: 'abcde' },
        state: {
          locale: 'fr-FR',
        },
      };
      const accessToken = 'access.token';
      const oidcAuthenticationService = {};

      oidcAuthenticationServiceRegistryStub.getOidcProviderServiceByCode
        .withArgs({ identityProviderCode: identityProvider })
        .returns(oidcAuthenticationService);

      const dependencies = {
        oidcAuthenticationServiceRegistry: oidcAuthenticationServiceRegistryStub,
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
      expect(oidcAuthenticationServiceRegistryStub.loadOidcProviderServices).to.have.been.calledOnce;
      expect(
        oidcAuthenticationServiceRegistryStub.configureReadyOidcProviderServiceByCode,
      ).to.have.been.calledWithExactly(identityProvider);
      expect(result.source.access_token).to.equal(accessToken);
      expect(result.source.logout_url_uuid).to.equal('logoutUrlUUID');
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
