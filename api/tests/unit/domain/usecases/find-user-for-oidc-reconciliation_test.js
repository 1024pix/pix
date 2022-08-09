const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const findUserForOidcReconciliation = require('../../../../lib/domain/usecases/find-user-for-oidc-reconciliation');
const { AuthenticationKeyExpired, DifferentExternalIdentifierError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-user-for-oidc-reconciliation', function () {
  let authenticationMethodRepository, userRepository;
  let pixAuthenticationService, authenticationSessionService, oidcAuthenticationService;

  beforeEach(function () {
    authenticationMethodRepository = { findOneByUserIdAndIdentityProvider: sinon.stub() };
    userRepository = {};
    pixAuthenticationService = { getUserByUsernameAndPassword: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub(), update: sinon.stub() };
    oidcAuthenticationService = { createAccessToken: sinon.stub(), saveIdToken: sinon.stub() };
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
    it('should save user id in existing key', async function () {
      // given
      const sessionContentAndUserInfo = { sessionContent: { idToken: 'idToken' }, userInfo: { firstName: 'Anne' } };
      pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });
      authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(null);
      authenticationSessionService.getByKey.resolves(sessionContentAndUserInfo);

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
      expect(authenticationSessionService.update).to.be.calledOnceWith('authenticationKey', sessionContentAndUserInfo);
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
      it('should return access token and logout url uuid', async function () {
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
        expect(result).to.deep.equal({ pixAccessToken: 'accessToken', logoutUrlUUID: 'logoutUrl' });
      });
    });
  });
});
