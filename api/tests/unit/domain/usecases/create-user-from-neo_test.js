const moment = require('moment');

const { domainBuilder, expect, sinon, catchErr } = require('../../../test-helper');

const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const NeoTokens = require('../../../../lib/domain/models/NeoTokens');
const User = require('../../../../lib/domain/models/User');

const {
  InvalidExternalAPIResponseError,
  AuthenticationKeyForNeoTokenExpired,
} = require('../../../../lib/domain/errors');
const logger = require('../../../../lib/infrastructure/logger');

const createUserFromNeo = require('../../../../lib/domain/usecases/create-user-from-neo');

describe('Unit | UseCase | create-user-from-neo', function () {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const domainTransaction = Symbol();

  let clock;
  let authenticationMethodRepository;
  let neoTokensRepository;
  let userRepository;
  let authenticationService;

  const now = new Date('2022-03-02');

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);

    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };

    authenticationMethodRepository = {
      create: sinon.stub(),
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
    };

    neoTokensRepository = {
      getByKey: sinon.stub(),
    };

    userRepository = {
      findByNeoExternalIdentifier: sinon.stub(),
      create: sinon.stub(),
    };

    authenticationService = {
      getNeoUserInfo: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('should throw an AuthenticationKeyForNeoTokenExpired if key expired', async function () {
    // given
    const authenticationKey = 'authenticationKey';
    neoTokensRepository.getByKey.withArgs(authenticationKey).resolves(null);

    // when
    const error = await catchErr(createUserFromNeo)({
      authenticationKey,
      authenticationMethodRepository,
      neoTokensRepository,
      userRepository,
      authenticationService,
    });

    // then
    expect(error).to.be.instanceOf(AuthenticationKeyForNeoTokenExpired);
    expect(error.message).to.be.equal('This authentication key for Neo token has expired.');
  });

  context('When there is no user with Neo authentication method', function () {
    it('should create the user and the authentication method', async function () {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const neoTokens = new NeoTokens({
        accessToken: 'accessToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      neoTokensRepository.getByKey.withArgs(authenticationKey).resolves(neoTokens);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      authenticationService.getNeoUserInfo.withArgs(neoTokens.accessToken).resolves(decodedUserInfo);

      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: AuthenticationMethod.identityProviders.NEO,
        })
        .resolves(null);

      userRepository.create.resolves({ id: userId });

      const expectedUser = new User({
        firstName: decodedUserInfo.firstName,
        lastName: decodedUserInfo.lastName,
        cgu: true,
        lastTermsOfServiceValidatedAt: now,
      });

      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.NEO,
        externalIdentifier: decodedUserInfo.externalIdentityId,
        authenticationComplement: new AuthenticationMethod.NeoAuthenticationComplement({
          accessToken: neoTokens.accessToken,
          refreshToken: neoTokens.refreshToken,
          expiredDate: moment().add(neoTokens.expiresIn, 's').toDate(),
        }),
        userId,
      });

      // when
      const response = await createUserFromNeo({
        authenticationKey,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
        authenticationService,
      });

      // then
      expect(userRepository.create).to.have.been.calledWithMatch({
        user: expectedUser,
        domainTransaction,
      });
      expect(authenticationMethodRepository.create).to.have.been.calledWith({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(response.userId).to.equal(userId);
    });

    it('should raise an error and log details if required properties are not returned by external API', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      const neoTokens = new NeoTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      neoTokensRepository.getByKey.withArgs(authenticationKey).resolves(neoTokens);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: undefined,
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };

      authenticationService.getNeoUserInfo.withArgs(neoTokens.accessToken).resolves(decodedUserInfo);

      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(createUserFromNeo)({
        authenticationKey,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
        authenticationService,
      });

      // then
      expect(error).to.be.instanceOf(InvalidExternalAPIResponseError);
      expect(error.message).to.be.equal('API PE: les informations utilisateurs récupérées sont incorrectes.');
      const expectedMessage = `Un des champs obligatoires n'a pas été renvoyé par /userinfo: ${JSON.stringify(
        decodedUserInfo
      )}.`;
      expect(logger.error).to.have.been.calledWith(expectedMessage);
    });
  });

  context('When there is already a user with Neo authentication method', function () {
    it('should neither create the user nor the authentication method', async function () {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const neoTokens = new NeoTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      neoTokensRepository.getByKey.withArgs(authenticationKey).resolves(neoTokens);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      authenticationService.getNeoUserInfo.withArgs(neoTokens.accessToken).resolves(decodedUserInfo);

      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withNeoAsIdentityProvider({ userId });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: AuthenticationMethod.identityProviders.NEO,
        })
        .resolves(authenticationMethod);

      // when
      const response = await createUserFromNeo({
        authenticationKey,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
        authenticationService,
      });

      // then
      expect(userRepository.create).to.not.have.been.called;
      expect(authenticationMethodRepository.create).to.not.have.been.called;
      expect(response.userId).to.equal(userId);
    });
  });
});
