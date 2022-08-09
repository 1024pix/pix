const { expect, sinon, catchErr } = require('../../../test-helper');
const findUserForOidcReconciliation = require('../../../../lib/domain/usecases/find-user-for-oidc-reconciliation');
const { AuthenticationKeyExpired } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-user-for-oidc-reconciliation', function () {
  let authenticationMethodRepository, userRepository;
  let pixAuthenticationService, authenticationSessionService;

  beforeEach(function () {
    authenticationMethodRepository = { findOneByUserIdAndIdentityProvider: sinon.stub() };
    userRepository = {};
    pixAuthenticationService = { getUserByUsernameAndPassword: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub(), update: sinon.stub() };
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
});
