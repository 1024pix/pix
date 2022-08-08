const { expect, sinon, catchErr } = require('../../../test-helper');
const {
  AuthenticationKeyExpired,
  UserAlreadyExistsWithAuthenticationMethodError,
} = require('../../../../lib/domain/errors');
const createOidcUser = require('../../../../lib/domain/usecases/create-oidc-user');

describe('Unit | UseCase | create-user-from-external-identity-provider', function () {
  let authenticationMethodRepository, userToCreateRepository;
  let authenticationSessionService, oidcAuthenticationService;
  let authenticationServiceRegistry;
  let clock;
  const now = new Date('2021-01-02');

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);

    authenticationMethodRepository = {
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
    };

    authenticationSessionService = {
      getByKey: sinon.stub(),
    };

    oidcAuthenticationService = {
      getUserInfo: sinon.stub(),
      createUserAccount: sinon.stub(),
    };

    authenticationServiceRegistry = {
      lookupAuthenticationService: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when authentication key is expired', function () {
    it('should throw an AuthenticationKeyExpired', async function () {
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
    it('should throw UserAlreadyExistsWithAuthenticationMethodError', async function () {
      // given
      authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves({
        sessionContent: { idToken: 'idToken', accessToken: 'accessToken' },
        userInfo: { firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'duGAR' },
      });
      authenticationServiceRegistry.lookupAuthenticationService
        .withArgs('SOME_IDP')
        .resolves(oidcAuthenticationService);
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({ externalIdentifier: 'duGAR', identityProvider: 'SOME_IDP' })
        .resolves({ userId: 'FOUND_USER_ID' });

      // when
      const error = await catchErr(createOidcUser)({
        identityProvider: 'SOME_IDP',
        authenticationKey: 'AUTHENTICATION_KEY',
        authenticationServiceRegistry,
        authenticationSessionService,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      expect(error).to.be.instanceOf(UserAlreadyExistsWithAuthenticationMethodError);
      expect(error.message).to.equal('Authentication method already exists for this external identifier.');
    });
  });

  it('should call createUserAccount method to return user id and id token', async function () {
    // given
    authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves({
      sessionContent: { idToken: 'idToken', accessToken: 'accessToken' },
      userInfo: { firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'duGAR' },
    });
    authenticationServiceRegistry.lookupAuthenticationService.withArgs('SOME_IDP').resolves(oidcAuthenticationService);
    authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
      .withArgs({ externalIdentifier: 'duGAR', identityProvider: 'SOME_IDP' })
      .resolves(null);

    // when
    await createOidcUser({
      identityProvider: 'SOME_IDP',
      authenticationKey: 'AUTHENTICATION_KEY',
      authenticationServiceRegistry,
      authenticationSessionService,
      authenticationMethodRepository,
      userToCreateRepository,
    });

    // then
    const expectedUser = {
      firstName: 'Jean',
      lastName: 'Heymar',
      cgu: true,
      lastTermsOfServiceValidatedAt: now,
    };
    expect(oidcAuthenticationService.createUserAccount).to.have.been.calledWithMatch({
      user: expectedUser,
      sessionContent: { idToken: 'idToken', accessToken: 'accessToken' },
      externalIdentityId: 'duGAR',
      authenticationMethodRepository,
      userToCreateRepository,
    });
  });
});
