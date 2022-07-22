const { expect, sinon, catchErr } = require('../../../test-helper');
const {
  InvalidExternalAPIResponseError,
  AuthenticationKeyExpired,
  UserAlreadyExistsWithAuthenticationMethodError,
} = require('../../../../lib/domain/errors');
const logger = require('../../../../lib/infrastructure/logger');
const createUserFromExternalIdentityProvider = require('../../../../lib/domain/usecases/create-user-from-external-identity-provider');

describe('Unit | UseCase | create-user-from-external-identity-provider', function () {
  let authenticationMethodRepository, userToCreateRepository;
  let authenticationSessionService, authenticationService, oidcAuthenticationService;
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

    authenticationService = {
      createUserAccount: sinon.stub(),
    };

    oidcAuthenticationService = {
      getUserInfo: sinon.stub(),
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
      const error = await catchErr(createUserFromExternalIdentityProvider)({
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
      authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves('SESSION_CONTENT');
      authenticationServiceRegistry.lookupAuthenticationService
        .withArgs('SOME_IDP')
        .resolves({ oidcAuthenticationService });
      oidcAuthenticationService.getUserInfo
        .withArgs('SESSION_CONTENT')
        .resolves({ firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'duGAR' });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({ externalIdentifier: 'duGAR', identityProvider: 'SOME_IDP' })
        .resolves({ userId: 'FOUND_USER_ID' });

      // when
      const error = await catchErr(createUserFromExternalIdentityProvider)({
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

  context('when required properties are not returned by external API', function () {
    it('should raise an error and log details', async function () {
      // given
      const authenticationSessionContent = 'SESSION_CONTENT';
      authenticationSessionService.getByKey.resolves(authenticationSessionContent);
      authenticationServiceRegistry.lookupAuthenticationService.resolves({
        oidcAuthenticationService,
      });
      oidcAuthenticationService.getUserInfo.resolves({
        firstName: 'Jean',
        lastName: undefined,
        externalIdentityId: 'externalIdentityId',
      });
      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(createUserFromExternalIdentityProvider)({
        authenticationKey: 'AUTHENTICATION_KEY',
        authenticationSessionService,
        authenticationServiceRegistry,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      expect(error).to.be.instanceOf(InvalidExternalAPIResponseError);
      expect(error.message).to.be.equal('Les informations utilisateurs récupérées sont incorrectes.');
      const expectedMessage = `Un des champs obligatoires n'a pas été renvoyé : ${JSON.stringify({
        firstName: 'Jean',
        lastName: undefined,
        externalIdentityId: 'externalIdentityId',
      })}.`;
      expect(logger.error).to.have.been.calledWith(expectedMessage);
    });
  });

  it('should call createUserAccount method to return user id and id token', async function () {
    // given
    authenticationSessionService.getByKey.withArgs('AUTHENTICATION_KEY').resolves('SESSION_CONTENT');
    authenticationServiceRegistry.lookupAuthenticationService
      .withArgs('SOME_IDP')
      .resolves({ authenticationService, oidcAuthenticationService });
    oidcAuthenticationService.getUserInfo
      .withArgs('SESSION_CONTENT')
      .resolves({ firstName: 'Jean', lastName: 'Heymar', externalIdentityId: 'duGAR' });
    authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
      .withArgs({ externalIdentifier: 'duGAR', identityProvider: 'SOME_IDP' })
      .resolves(null);

    // when
    await createUserFromExternalIdentityProvider({
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
    expect(authenticationService.createUserAccount).to.have.been.calledWithMatch({
      user: expectedUser,
      sessionContent: 'SESSION_CONTENT',
      externalIdentityId: 'duGAR',
      authenticationMethodRepository,
      userToCreateRepository,
    });
  });
});
