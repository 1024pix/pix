import { UserAlreadyExistsWithAuthenticationMethodError } from '../../../../../lib/domain/errors.js';
import { AuthenticationKeyExpired } from '../../../../../src/identity-access-management/domain/errors.js';
import { createOidcUser } from '../../../../../src/identity-access-management/domain/usecases/create-oidc-user.usecase.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | create-oidc-user', function () {
  let authenticationMethodRepository, userToCreateRepository, userLoginRepository;
  let authenticationSessionService, oidcAuthenticationService, oidcAuthenticationServiceRegistry;
  let clock;
  const now = new Date('2021-01-02');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

    authenticationMethodRepository = {
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
    };

    authenticationSessionService = {
      getByKey: sinon.stub(),
    };

    oidcAuthenticationService = {
      shouldCloseSession: true,
      getUserInfo: sinon.stub(),
      createUserAccount: sinon.stub(),
      createAccessToken: sinon.stub(),
      saveIdToken: sinon.stub(),
    };
    oidcAuthenticationServiceRegistry = {
      loadOidcProviderServices: sinon.stub().resolves(),
      configureReadyOidcProviderServiceByCode: sinon.stub().resolves(),
      getOidcProviderServiceByCode: sinon.stub().returns(oidcAuthenticationService),
    };

    userLoginRepository = {
      updateLastLoggedAt: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when authentication key is expired', function () {
    it('throws an AuthenticationKeyExpiredError', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(null);

      // when
      const error = await catchErr(createOidcUser)({
        authenticationKey,
        authenticationMethodRepository,
        userToCreateRepository,
        authenticationSessionService,
      });

      // then
      expect(error).to.be.instanceOf(AuthenticationKeyExpired);
      expect(error.message).to.be.equal('This authentication key has expired.');
    });
  });

  context('when there is already an authentication method for this external id', function () {
    it('throws an UserAlreadyExistsWithAuthenticationMethodError', async function () {
      // given
      authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves({
        sessionContent: { idToken: 'idToken', accessToken: 'accessToken' },
        userInfo: { firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'duGAR' },
      });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({ externalIdentifier: 'duGAR', identityProvider: 'SOME_IDP' })
        .resolves({ userId: 'FOUND_USER_ID' });

      // when
      const error = await catchErr(createOidcUser)({
        identityProvider: 'SOME_IDP',
        authenticationKey: 'AUTHENTICATION_KEY',
        authenticationSessionService,
        oidcAuthenticationServiceRegistry,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserAlreadyExistsWithAuthenticationMethodError);
      expect(error.message).to.equal('Authentication method already exists for this external identifier.');
    });
  });

  it('creates the user account with given language and returns an access token, the logout url uuid and update the last logged date with the existing external user id', async function () {
    // given
    const idToken = 'idToken';
    const language = 'nl';
    authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves({
      sessionContent: { idToken, accessToken: 'accessToken' },
      userInfo: { firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'externalId' },
    });
    authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
      .withArgs({ externalIdentifier: 'externalId', identityProvider: 'SOME_IDP' })
      .resolves(null);
    oidcAuthenticationService.createUserAccount.resolves(10);
    oidcAuthenticationService.createAccessToken.withArgs(10).returns('accessTokenForExistingExternalUser');
    oidcAuthenticationService.saveIdToken.withArgs({ idToken, userId: 10 }).resolves('logoutUrlUUID');

    // when
    const result = await createOidcUser({
      identityProvider: 'SOME_IDP',
      authenticationKey: 'AUTHENTICATION_KEY',
      localeFromCookie: 'nl-BE',
      language,
      authenticationSessionService,
      oidcAuthenticationServiceRegistry,
      authenticationMethodRepository,
      userToCreateRepository,
      userLoginRepository,
    });

    // then
    expect(oidcAuthenticationService.createUserAccount).to.have.been.calledWithMatch({
      user: {
        firstName: 'Jean',
        lastName: 'Heymar',
        locale: 'nl-BE',
        lang: 'nl',
        cgu: true,
        lastTermsOfServiceValidatedAt: now,
      },
      sessionContent: { idToken, accessToken: 'accessToken' },
      externalIdentityId: 'externalId',
      userToCreateRepository,
      authenticationMethodRepository,
    });
    sinon.assert.calledOnce(oidcAuthenticationService.createAccessToken);
    sinon.assert.calledOnce(oidcAuthenticationService.saveIdToken);
    sinon.assert.calledOnceWithExactly(userLoginRepository.updateLastLoggedAt, { userId: 10 });
    expect(result).to.deep.equal({
      accessToken: 'accessTokenForExistingExternalUser',
      logoutUrlUUID: 'logoutUrlUUID',
    });
  });
});
