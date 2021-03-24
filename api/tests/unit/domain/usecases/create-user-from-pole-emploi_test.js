const { domainBuilder, expect, sinon } = require('../../../test-helper');
const createUserFromPoleEmploi = require('../../../../lib/domain/usecases/create-user-from-pole-emploi');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const User = require('../../../../lib/domain/models/User');
const authenticationCache = require('../../../../lib/infrastructure/caches/authentication-cache');
const moment = require('moment');

describe('Unit | UseCase | create-user-from-pole-emploi', function() {

  const domainTransaction = Symbol();

  let clock;
  let authenticationCacheGetStub;
  let userRepository;
  let authenticationMethodRepository;
  let authenticationService;

  beforeEach(function() {
    clock = sinon.useFakeTimers(Date.now());
    DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };
    authenticationCacheGetStub = sinon.stub(authenticationCache, 'get');
    userRepository = {
      findByPoleEmploiExternalIdentifier: sinon.stub(),
      create: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
      findOneByExternalIdentifierAndIdentityProvider: sinon.stub(),
    };
    authenticationService = {
      getPoleEmploiUserInfo: sinon.stub(),
    };
  });

  afterEach(function() {
    clock.restore();
  });

  context('When there is no user with Pole Emploi authentication method', function() {

    it('should create the user and the authentication method', async function() {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const userCredentials = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      authenticationCacheGetStub.withArgs(authenticationKey).resolves(userCredentials);
      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      authenticationService.getPoleEmploiUserInfo.withArgs(userCredentials.idToken).resolves(decodedUserInfo);
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider.withArgs({
        externalIdentifier: decodedUserInfo.externalIdentityId,
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      }).resolves(null);

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
          accessToken: userCredentials.accessToken,
          refreshToken: userCredentials.refreshToken,
          expiredDate: moment().add(userCredentials.expiresIn, 's').toDate(),
        }),
        userId,
      });

      // when
      const response = await createUserFromPoleEmploi({
        authenticationKey,
        userRepository,
        authenticationMethodRepository,
        authenticationService,
      });

      // then
      expect(userRepository.create).to.have.been.calledWithMatch({ user: expectedUser, domainTransaction });
      expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod, domainTransaction });
      expect(response.userId).to.equal(userId);
      expect(response.idToken).to.equal(userCredentials.idToken);
    });
  });

  context('When there is already a user with Pole Emploi authentication method', function() {

    it('should neither create the user nor the authentication method', async function() {
      // given
      const userId = 123;
      const authenticationKey = 'authenticationKey';
      const userCredentials = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      authenticationCacheGetStub.withArgs(authenticationKey).resolves(userCredentials);
      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      authenticationService.getPoleEmploiUserInfo.withArgs(userCredentials.idToken).resolves(decodedUserInfo);

      const authenticationMethod = domainBuilder.buildAuthenticationMethod({ userId });
      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider.withArgs({
        externalIdentifier: decodedUserInfo.externalIdentityId,
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      }).resolves(authenticationMethod);

      const response = await createUserFromPoleEmploi({
        authenticationKey,
        userRepository,
        authenticationMethodRepository,
        authenticationService,
      });

      // then
      expect(userRepository.create).to.not.have.been.called;
      expect(authenticationMethodRepository.create).to.not.have.been.called;
      expect(response.userId).to.equal(userId);
      expect(response.idToken).to.equal(userCredentials.idToken);
    });
  });
});
