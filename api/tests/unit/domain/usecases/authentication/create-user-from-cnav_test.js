const { domainBuilder, expect, sinon, catchErr } = require('../../../../test-helper');

const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');

const { InvalidExternalAPIResponseError, AuthenticationKeyExpired } = require('../../../../../lib/domain/errors');
const logger = require('../../../../../lib/infrastructure/logger');

const createUserFromCnav = require('../../../../../lib/domain/usecases/authentication/create-user-from-cnav');

describe('Unit | UseCase | create-user-from-cnav', function () {
  let domainTransaction;
  let clock;
  let authenticationMethodRepository;
  let authenticationSessionService;
  let userToCreateRepository;
  let cnavAuthenticationService;

  const now = new Date('2021-01-02');

  beforeEach(function () {
    domainTransaction = Symbol();
    clock = sinon.useFakeTimers(now);

    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };

    authenticationMethodRepository = {
      create: sinon.stub(),
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
    };

    authenticationSessionService = {
      getByKey: sinon.stub(),
    };

    userToCreateRepository = {
      create: sinon.stub(),
    };

    cnavAuthenticationService = {
      getUserInfo: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('should throw an AuthenticationKeyExpired if key expired', async function () {
    // given
    const authenticationKey = 'authenticationKey';
    authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(null);

    // when
    const error = await catchErr(createUserFromCnav)({
      authenticationKey,
      authenticationMethodRepository,
      authenticationSessionService,
      userToCreateRepository,
      cnavAuthenticationService,
    });

    // then
    expect(error).to.be.instanceOf(AuthenticationKeyExpired);
    expect(error.message).to.be.equal('This authentication key has expired.');
  });

  context('When there is no user with Cnav authentication method', function () {
    it('should create the user and the authentication method', async function () {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const idToken = 'idToken';
      authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(idToken);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      cnavAuthenticationService.getUserInfo.withArgs(idToken).resolves(decodedUserInfo);

      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: AuthenticationMethod.identityProviders.CNAV,
        })
        .resolves(null);

      userToCreateRepository.create.resolves({ id: userId });

      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.CNAV,
        externalIdentifier: decodedUserInfo.externalIdentityId,
        userId,
      });

      // when
      const response = await createUserFromCnav({
        authenticationKey,
        authenticationMethodRepository,
        authenticationSessionService,
        userToCreateRepository,
        cnavAuthenticationService,
      });

      // then
      const expectedUser = {
        firstName: decodedUserInfo.firstName,
        lastName: decodedUserInfo.lastName,
        cgu: true,
        lastTermsOfServiceValidatedAt: now,
      };
      expect(userToCreateRepository.create).to.have.been.calledWithMatch({
        user: expectedUser,
        domainTransaction,
      });
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(response).to.equal(userId);
    });

    it('should raise an error and log details if required properties are not returned by external API', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      const idToken = 'idToken';
      authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(idToken);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: undefined,
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };

      cnavAuthenticationService.getUserInfo.withArgs(idToken).resolves(decodedUserInfo);

      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(createUserFromCnav)({
        authenticationKey,
        authenticationMethodRepository,
        authenticationSessionService,
        userToCreateRepository,
        cnavAuthenticationService,
      });

      // then
      expect(error).to.be.instanceOf(InvalidExternalAPIResponseError);
      expect(error.message).to.be.equal('API CNAV: les informations utilisateurs récupérées sont incorrectes.');
      const expectedMessage = `Un des champs obligatoires n'a pas été renvoyé par /userinfo: ${JSON.stringify(
        decodedUserInfo
      )}.`;
      expect(logger.error).to.have.been.calledWith(expectedMessage);
    });
  });

  context('When there is already a user with Cnav authentication method', function () {
    it('should neither create the user nor the authentication method', async function () {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const idToken = 'idToken';
      authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(idToken);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      cnavAuthenticationService.getUserInfo.withArgs(idToken).resolves(decodedUserInfo);

      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withCnavAsIdentityProvider({ userId });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: AuthenticationMethod.identityProviders.CNAV,
        })
        .resolves(authenticationMethod);

      // when
      const response = await createUserFromCnav({
        authenticationKey,
        authenticationMethodRepository,
        authenticationSessionService,
        userToCreateRepository,
        cnavAuthenticationService,
      });

      // then
      expect(userToCreateRepository.create).to.not.have.been.called;
      expect(authenticationMethodRepository.create).to.not.have.been.called;
      expect(response).to.equal(userId);
    });
  });
});
