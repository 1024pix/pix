const moment = require('moment');

const { domainBuilder, expect, sinon, catchErr } = require('../../../test-helper');

const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');
const User = require('../../../../lib/domain/models/User');

const { InvalidExternalAPIResponseError, AuthenticationKeyForPoleEmploiTokenExpired } = require('../../../../lib/domain/errors');
const logger = require('../../../../lib/infrastructure/logger');

const createUserFromPoleEmploi = require('../../../../lib/domain/usecases/create-user-from-pole-emploi');

describe('Unit | UseCase | create-user-from-pole-emploi', () => {

  const domainTransaction = Symbol();

  let clock;
  let authenticationMethodRepository;
  let poleEmploiTokensRepository;
  let userRepository;
  let authenticationService;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());

    DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };

    authenticationMethodRepository = {
      create: sinon.stub(),
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
    };

    poleEmploiTokensRepository = {
      getByKey: sinon.stub(),
    };

    userRepository = {
      findByPoleEmploiExternalIdentifier: sinon.stub(),
      create: sinon.stub(),
    };

    authenticationService = {
      getPoleEmploiUserInfo: sinon.stub(),
    };
  });

  afterEach(() => {
    clock.restore();
  });

  it('should throw an AuthenticationKeyForPoleEmploiTokenExpired if key expired', async () => {
    // given
    const authenticationKey = 'authenticationKey';
    poleEmploiTokensRepository.getByKey
      .withArgs(authenticationKey)
      .resolves(null);

    // when
    const error = await catchErr(createUserFromPoleEmploi)({
      authenticationKey,
      authenticationMethodRepository,
      poleEmploiTokensRepository,
      userRepository,
      authenticationService,
    });

    // then
    expect(error).to.be.instanceOf(AuthenticationKeyForPoleEmploiTokenExpired);
    expect(error.message).to.be.equal('This authentication key for pole emploi token has expired.');
  });

  context('When there is no user with Pole Emploi authentication method', () => {

    it('should create the user and the authentication method', async () => {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      poleEmploiTokensRepository.getByKey
        .withArgs(authenticationKey)
        .resolves(poleEmploiTokens);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      authenticationService.getPoleEmploiUserInfo
        .withArgs(poleEmploiTokens.idToken)
        .resolves(decodedUserInfo);

      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        })
        .resolves(null);

      userRepository.create.resolves({ id: userId });

      const expectedUser = new User({
        firstName: decodedUserInfo.firstName,
        lastName: decodedUserInfo.lastName,
        cgu: true,
      });

      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        externalIdentifier: decodedUserInfo.externalIdentityId,
        authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken: poleEmploiTokens.accessToken,
          refreshToken: poleEmploiTokens.refreshToken,
          expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
        }),
        userId,
      });

      // when
      const response = await createUserFromPoleEmploi({
        authenticationKey,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
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
      expect(response.idToken).to.equal(poleEmploiTokens.idToken);
    });

    it('should raise an error and log details if required properties are not returned by external API', async () => {
      // given
      const authenticationKey = 'authenticationKey';
      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      poleEmploiTokensRepository.getByKey
        .withArgs(authenticationKey)
        .resolves(poleEmploiTokens);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: undefined,
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };

      authenticationService.getPoleEmploiUserInfo
        .withArgs(poleEmploiTokens.idToken)
        .resolves(decodedUserInfo);

      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(createUserFromPoleEmploi)({
        authenticationKey,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
        authenticationService,
      });

      // then
      expect(error).to.be.instanceOf(InvalidExternalAPIResponseError);
      expect(error.message).to.be.equal('API PE: les informations utilisateurs récupérées sont incorrectes.');
      const expectedMessage = `Un des champs obligatoires n'a pas été renvoyé par /userinfo: ${JSON.stringify(decodedUserInfo)}.`;
      expect(logger.error).to.have.been.calledWith(expectedMessage);
    });
  });

  context('When there is already a user with Pole Emploi authentication method', () => {

    it('should neither create the user nor the authentication method', async () => {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      });
      poleEmploiTokensRepository.getByKey
        .withArgs(authenticationKey)
        .resolves(poleEmploiTokens);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      authenticationService.getPoleEmploiUserInfo
        .withArgs(poleEmploiTokens.idToken)
        .resolves(decodedUserInfo);

      const authenticationMethod = domainBuilder.buildAuthenticationMethod({ userId });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        })
        .resolves(authenticationMethod);

      // when
      const response = await createUserFromPoleEmploi({
        authenticationKey,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
        authenticationService,
      });

      // then
      expect(userRepository.create).to.not.have.been.called;
      expect(authenticationMethodRepository.create).to.not.have.been.called;
      expect(response.userId).to.equal(userId);
      expect(response.idToken).to.equal(poleEmploiTokens.idToken);
    });
  });
});
