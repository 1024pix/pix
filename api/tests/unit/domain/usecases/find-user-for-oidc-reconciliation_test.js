const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const findUserForOidcReconciliation = require('../../../../lib/domain/usecases/find-user-for-oidc-reconciliation');
const { AuthenticationKeyExpired, DifferentExternalIdentifierError } = require('../../../../lib/domain/errors');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

describe('Unit | UseCase | find-user-for-oidc-reconciliation', function () {
  let authenticationMethodRepository, userRepository;
  let pixAuthenticationService, authenticationSessionService, oidcAuthenticationService;

  beforeEach(function () {
    authenticationMethodRepository = {
      findOneByUserIdAndIdentityProvider: sinon.stub(),
      updateAuthenticationComplementByUserIdAndIdentityProvider: sinon.stub(),
    };
    userRepository = { updateLastLoggedAt: sinon.stub() };
    pixAuthenticationService = { getUserByUsernameAndPassword: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub(), update: sinon.stub() };
    oidcAuthenticationService = {
      createAccessToken: sinon.stub(),
      saveIdToken: sinon.stub(),
      createAuthenticationComplement: sinon.stub(),
    };
  });

  it('should find pix user and their oidc authentication method', async function () {
    // given
    pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
    authenticationSessionService.getByKey.resolves({
      sessionContent: { idToken: 'idToken' },
      userInfo: { firstName: 'Anne' },
    });

    // when
    await findUserForOidcReconciliation({
      email: 'ane.trotro@example.net',
      password: 'pix123',
      identityProvider: 'oidc',
      authenticationSessionService,
      pixAuthenticationService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(pixAuthenticationService.getUserByUsernameAndPassword).to.be.calledOnceWith({
      username: 'ane.trotro@example.net',
      password: 'pix123',
      userRepository,
    });

    expect(authenticationMethodRepository.findOneByUserIdAndIdentityProvider).to.be.calledOnceWith({
      userId: 2,
      identityProvider: 'oidc',
    });
  });

  it('should retrieve user session content', async function () {
    // given
    pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
    authenticationSessionService.getByKey.resolves({
      sessionContent: { idToken: 'idToken' },
      userInfo: { firstName: 'Anne' },
    });

    // when
    await findUserForOidcReconciliation({
      authenticationKey: 'authenticationKey',
      email: 'ane.trotro@example.net',
      password: 'pix123',
      identityProvider: 'oidc',
      authenticationSessionService,
      pixAuthenticationService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(authenticationSessionService.getByKey).to.be.calledOnceWith('authenticationKey');
  });

  context('when authentication key is expired', function () {
    it('should throw an AuthenticationKeyExpired', async function () {
      // given
      pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
      authenticationSessionService.getByKey.resolves(null);

      // when
      const error = await catchErr(findUserForOidcReconciliation)({
        authenticationKey: 'authenticationKey',
        email: 'ane.trotro@example.net',
        password: 'pix123',
        identityProvider: 'oidc',
        authenticationSessionService,
        pixAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationKeyExpired);
      expect(error.message).to.be.equal('This authentication key has expired.');
    });
  });

  context('when user has no oidc authentication method', function () {
    it('should return full names', async function () {
      // given
      const firstName = 'Sarah';
      const lastName = 'Pix';
      const sessionContentAndUserInfo = {
        sessionContent: { idToken: 'idToken' },
        userInfo: { firstName: 'Sarah', lastName: 'Idp' },
      };
      const pixAuthenticationMethod =
        domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({});
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);
      pixAuthenticationService.getUserByUsernameAndPassword.resolves({
        id: 2,
        firstName,
        lastName,
        email: 'sarahcroche@example.net',
        username: 'sarahcroche123',
      });
      authenticationSessionService.getByKey.resolves(sessionContentAndUserInfo);

      // when
      const result = await findUserForOidcReconciliation({
        authenticationKey: 'authenticationKey',
        email: 'ane.trotro@example.net',
        password: 'pix123',
        identityProvider: 'oidc',
        authenticationSessionService,
        pixAuthenticationService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(authenticationSessionService.update).to.be.calledOnceWith('authenticationKey', sessionContentAndUserInfo);
      expect(result).to.deep.equal({
        fullNameFromPix: 'Sarah Pix',
        fullNameFromExternalIdentityProvider: 'Sarah Idp',
        email: 'sarahcroche@example.net',
        username: 'sarahcroche123',
      });
    });
  });

  context('when user has an oidc authentication method', function () {
    context('when externalIdentifier and externalIdentityId are different', function () {
      it('should throw an DifferentExternalIdentifierError', async function () {
        // given
        const oidcAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          externalIdentifier: '789fge',
        });
        pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(oidcAuthenticationMethod);
        authenticationSessionService.getByKey.resolves({
          sessionContent: {},
          userInfo: { externalIdentityId: '123abc' },
        });

        // when
        const error = await catchErr(findUserForOidcReconciliation)({
          authenticationKey: 'authenticationKey',
          email: 'ane.trotro@example.net',
          password: 'pix123',
          identityProvider: 'POLE_EMPLOI',
          authenticationSessionService,
          pixAuthenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(error).to.be.instanceOf(DifferentExternalIdentifierError);
      });
    });

    context('when externalIdentifier and externalIdentityId are the same', function () {
      context('when the provider have an authentication complement', function () {
        it('should update authentication complement', async function () {
          // given
          const oidcAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            externalIdentifier: '123abc',
          });
          const sessionContent = { accessToken: 'accessToken', refreshToken: 'refreshToken' };
          const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
            accessToken: sessionContent.accessToken,
            refreshToken: sessionContent.refreshToken,
            expiredDate: 1000,
          });

          pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(oidcAuthenticationMethod);
          authenticationSessionService.getByKey.resolves({
            sessionContent,
            userInfo: { externalIdentityId: '123abc' },
          });
          oidcAuthenticationService.createAuthenticationComplement.returns(authenticationComplement);

          // when
          await findUserForOidcReconciliation({
            authenticationKey: 'authenticationKey',
            email: 'ane.trotro@example.net',
            password: 'pix123',
            identityProvider: 'POLE_EMPLOI',
            authenticationSessionService,
            pixAuthenticationService,
            oidcAuthenticationService,
            authenticationMethodRepository,
            userRepository,
          });

          // then
          expect(
            authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider
          ).to.be.calledOnceWith({
            authenticationComplement,
            userId: 2,
            identityProvider: 'POLE_EMPLOI',
          });
        });
      });

      context('when the provider does not have an authentication complement', function () {
        it('should not update authentication complement', async function () {
          // given
          const oidcAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            externalIdentifier: '123abc',
          });
          pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(oidcAuthenticationMethod);
          authenticationSessionService.getByKey.resolves({
            sessionContent: { idToken: 'idToken' },
            userInfo: { externalIdentityId: '123abc' },
          });
          oidcAuthenticationService.createAuthenticationComplement.returns(null);

          // when
          await findUserForOidcReconciliation({
            authenticationKey: 'authenticationKey',
            email: 'ane.trotro@example.net',
            password: 'pix123',
            identityProvider: 'POLE_EMPLOI',
            authenticationSessionService,
            pixAuthenticationService,
            oidcAuthenticationService,
            authenticationMethodRepository,
            userRepository,
          });

          // then
          expect(
            authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider
          ).not.to.have.been.called;
        });
      });

      it('should return access token, logout url uuid and update last logged at parameter', async function () {
        // given
        const oidcAuthenticationMethod = domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          externalIdentifier: '123abc',
        });
        pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
        authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(oidcAuthenticationMethod);
        authenticationSessionService.getByKey.resolves({
          sessionContent: { idToken: 'idToken' },
          userInfo: { externalIdentityId: '123abc' },
        });
        oidcAuthenticationService.createAccessToken.resolves('accessToken');
        oidcAuthenticationService.saveIdToken.resolves('logoutUrl');

        // when
        const result = await findUserForOidcReconciliation({
          authenticationKey: 'authenticationKey',
          email: 'ane.trotro@example.net',
          password: 'pix123',
          identityProvider: 'POLE_EMPLOI',
          authenticationSessionService,
          pixAuthenticationService,
          oidcAuthenticationService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(oidcAuthenticationService.createAccessToken).to.be.calledOnceWith(2);
        expect(oidcAuthenticationService.saveIdToken).to.be.calledOnceWith({ idToken: 'idToken', userId: 2 });
        expect(userRepository.updateLastLoggedAt).to.be.calledOnceWith({ userId: 2 });
        expect(result).to.deep.equal({
          accessToken: 'accessToken',
          logoutUrlUUID: 'logoutUrl',
        });
      });
    });
  });
});
