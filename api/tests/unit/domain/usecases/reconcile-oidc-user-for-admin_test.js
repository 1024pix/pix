import { expect, sinon, catchErr } from '../../../test-helper.js';
import { reconcileOidcUserForAdmin } from '../../../../lib/domain/usecases/reconcile-oidc-user-for-admin.js';
import { AuthenticationKeyExpired } from '../../../../lib/domain/errors.js';
import { AuthenticationMethod } from '../../../../lib/domain/models/index.js';

describe('Unit | UseCase | reconcile-oidc-user-for-admin', function () {
  let authenticationMethodRepository, userRepository, authenticationSessionService, oidcAuthenticationService;
  const identityProvider = 'POLE_EMPLOI';

  beforeEach(function () {
    authenticationMethodRepository = { create: sinon.stub(), findByUserId: sinon.stub() };
    userRepository = { updateLastLoggedAt: sinon.stub(), getByEmail: sinon.stub() };
    authenticationSessionService = { getByKey: sinon.stub() };
    oidcAuthenticationService = {
      identityProvider,
      createAccessToken: sinon.stub(),
      createAuthenticationComplement: sinon.stub(),
    };
  });

  it('should retrieve user session content', async function () {
    // given
    const sessionContent = { idToken: 'idToken' };
    authenticationMethodRepository.findByUserId.resolves([]);
    userRepository.getByEmail.resolves({ email: 'anne@example.net', id: 2 });
    authenticationSessionService.getByKey.resolves({
      sessionContent,
      userInfo: { externalIdentityId: 'external_id', firstName: 'Anne' },
    });
    oidcAuthenticationService.createAuthenticationComplement
      .withArgs({ sessionContent })
      .returns(
        new AuthenticationMethod.OidcAuthenticationComplement({ accessToken: 'accessToken', expiredDate: new Date() }),
      );

    // when
    await reconcileOidcUserForAdmin({
      authenticationKey: 'authenticationKey',
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(authenticationSessionService.getByKey).to.be.calledOnceWith('authenticationKey');
  });

  it('should find user and his authentication methods', async function () {
    // given
    const email = 'sarah.pix@example.net';
    const sessionContent = { idToken: 'idToken' };
    authenticationSessionService.getByKey.resolves({
      sessionContent,
      userInfo: { externalIdentityId: 'external_id', firstName: 'Sarah' },
    });
    userRepository.getByEmail.resolves({ email, id: 2 });
    authenticationMethodRepository.findByUserId.resolves([]);
    oidcAuthenticationService.createAuthenticationComplement
      .withArgs({ sessionContent })
      .returns(
        new AuthenticationMethod.OidcAuthenticationComplement({ accessToken: 'accessToken', expiredDate: new Date() }),
      );

    // when
    await reconcileOidcUserForAdmin({
      authenticationKey: 'authenticationKey',
      email,
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(userRepository.getByEmail).to.be.calledOnceWith(email);
    expect(authenticationMethodRepository.findByUserId).to.be.calledOnceWith({ userId: 2 });
  });

  it('should create authentication method with complement', async function () {
    // given
    const sessionContent = { idToken: 'idToken' };
    const externalIdentifier = 'external_id';
    const userId = 1;
    authenticationMethodRepository.findByUserId.resolves([]);
    userRepository.getByEmail.resolves({ email: 'anne@example.net', id: userId });
    authenticationSessionService.getByKey.resolves({
      sessionContent,
      userInfo: { externalIdentityId: externalIdentifier, firstName: 'Anne' },
    });
    oidcAuthenticationService.createAuthenticationComplement
      .withArgs({ sessionContent })
      .returns(
        new AuthenticationMethod.OidcAuthenticationComplement({ accessToken: 'accessToken', expiredDate: new Date() }),
      );

    // when
    await reconcileOidcUserForAdmin({
      authenticationKey: 'authenticationKey',
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(authenticationMethodRepository.create).to.be.calledOnce;
    const { authenticationMethod } = authenticationMethodRepository.create.firstCall.args[0];
    expect(authenticationMethod).to.deep.contain({ identityProvider, externalIdentifier, userId });
    expect(authenticationMethod.authenticationComplement).to.be.instanceOf(
      AuthenticationMethod.OidcAuthenticationComplement,
    );
  });

  it('should return an access token and update the last logged date', async function () {
    // given
    const sessionContent = { idToken: 'idToken' };
    const externalIdentifier = 'external_id';
    const userId = 1;
    authenticationSessionService.getByKey.resolves({
      sessionContent,
      userInfo: { externalIdentityId: externalIdentifier, firstName: 'Anne' },
    });
    authenticationMethodRepository.findByUserId.resolves([]);
    userRepository.getByEmail.resolves({ email: 'anne@example.net', id: userId });
    oidcAuthenticationService.createAuthenticationComplement
      .withArgs({ sessionContent })
      .returns(
        new AuthenticationMethod.OidcAuthenticationComplement({ accessToken: 'accessToken', expiredDate: new Date() }),
      );
    oidcAuthenticationService.createAccessToken.withArgs(userId).returns('accessToken');

    // when
    const result = await reconcileOidcUserForAdmin({
      authenticationKey: 'authenticationKey',
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    sinon.assert.calledOnce(oidcAuthenticationService.createAccessToken);
    sinon.assert.calledOnceWithExactly(userRepository.updateLastLoggedAt, { userId });
    expect(result).to.equal('accessToken');
  });

  context('when authentication key is expired', function () {
    it('should throw an AuthenticationKeyExpired', async function () {
      // given
      authenticationSessionService.getByKey.resolves(null);

      // when
      const error = await catchErr(reconcileOidcUserForAdmin)({
        authenticationKey: 'authenticationKey',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationKeyExpired);
      expect(error.message).to.be.equal('This authentication key has expired.');
    });
  });
});
