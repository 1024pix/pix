const { expect, sinon, catchErr } = require('../../../test-helper');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { InvalidExternalAPIResponseError, AuthenticationKeyExpired } = require('../../../../lib/domain/errors');
const logger = require('../../../../lib/infrastructure/logger');
const createUserFromExternalIdp = require('../../../../lib/domain/usecases/create-user-from-external-idp');

describe('Unit | UseCase | create-user-from-external-idp', function () {
  let authenticationMethodRepository, userToCreateRepository;
  let authenticationSessionService, poleEmploiAuthenticationService, cnavAuthenticationService;
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

    poleEmploiAuthenticationService = {
      getUserInfo: sinon.stub(),
      createUserAccount: sinon.stub(),
    };

    cnavAuthenticationService = {
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

  it('should throw an AuthenticationKeyExpired if key expired', async function () {
    // given
    const authenticationKey = 'authenticationKey';
    authenticationSessionService.getByKey.withArgs(authenticationKey).resolves(null);

    // when
    const error = await catchErr(createUserFromExternalIdp)({
      authenticationKey,
      authenticationMethodRepository,
      userToCreateRepository,
      authenticationSessionService,
    });

    // then
    expect(error).to.be.instanceOf(AuthenticationKeyExpired);
    expect(error.message).to.be.equal('This authentication key has expired.');
  });

  context('when user comes from Pole Emploi', function () {
    it('should call createUserAccount method to return user id and id token', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      const poleEmploiIdentityProvider = AuthenticationMethod.identityProviders.POLE_EMPLOI;
      const poleEmploiAuthenticationSessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      authenticationSessionService.getByKey
        .withArgs(authenticationKey)
        .resolves(poleEmploiAuthenticationSessionContent);

      authenticationServiceRegistry.lookupAuthenticationService
        .withArgs(poleEmploiIdentityProvider)
        .resolves(poleEmploiAuthenticationService);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      poleEmploiAuthenticationService.getUserInfo
        .withArgs(poleEmploiAuthenticationSessionContent)
        .resolves(decodedUserInfo);

      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: poleEmploiIdentityProvider,
        })
        .resolves(null);

      // when
      await createUserFromExternalIdp({
        identityProvider: poleEmploiIdentityProvider,
        authenticationKey,
        authenticationServiceRegistry,
        authenticationSessionService,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      const expectedUser = {
        firstName: decodedUserInfo.firstName,
        lastName: decodedUserInfo.lastName,
        cgu: true,
        lastTermsOfServiceValidatedAt: now,
      };
      expect(poleEmploiAuthenticationService.createUserAccount).to.have.been.calledWithMatch({
        user: expectedUser,
        sessionContent: poleEmploiAuthenticationSessionContent,
        externalIdentityId: decodedUserInfo.externalIdentityId,
        authenticationMethodRepository,
        userToCreateRepository,
      });
    });

    it('should raise an error and log details if required properties are not returned by Pole Emploi external API', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      const poleEmploiAuthenticationSessionContent = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      authenticationSessionService.getByKey.resolves(poleEmploiAuthenticationSessionContent);
      authenticationServiceRegistry.lookupAuthenticationService.resolves(poleEmploiAuthenticationService);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: undefined,
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };

      poleEmploiAuthenticationService.getUserInfo.resolves(decodedUserInfo);

      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(createUserFromExternalIdp)({
        authenticationKey,
        authenticationSessionService,
        authenticationServiceRegistry,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      expect(error).to.be.instanceOf(InvalidExternalAPIResponseError);
      expect(error.message).to.be.equal('Les informations utilisateurs récupérées sont incorrectes.');
      const expectedMessage = `Un des champs obligatoires n'a pas été renvoyé : ${JSON.stringify(decodedUserInfo)}.`;
      expect(logger.error).to.have.been.calledWith(expectedMessage);
    });
  });

  context('when user comes from Cnav', function () {
    it('should call createUserAccount method', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      const cnavIdentityProvider = AuthenticationMethod.identityProviders.CNAV;
      const cnavIdToken = 'idToken';
      authenticationSessionService.getByKey.withArgs(authenticationKey).resolves({ cnavIdToken });

      authenticationServiceRegistry.lookupAuthenticationService
        .withArgs(cnavIdentityProvider)
        .resolves(cnavAuthenticationService);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: 'Heymar',
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };
      cnavAuthenticationService.getUserInfo.withArgs({ cnavIdToken }).resolves(decodedUserInfo);

      authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider
        .withArgs({
          externalIdentifier: decodedUserInfo.externalIdentityId,
          identityProvider: cnavIdentityProvider,
        })
        .resolves(null);

      // when
      await createUserFromExternalIdp({
        identityProvider: cnavIdentityProvider,
        authenticationKey,
        authenticationSessionService,
        authenticationServiceRegistry,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      const expectedUser = {
        firstName: decodedUserInfo.firstName,
        lastName: decodedUserInfo.lastName,
        cgu: true,
        lastTermsOfServiceValidatedAt: now,
      };
      expect(cnavAuthenticationService.createUserAccount).to.have.been.calledWithMatch({
        user: expectedUser,
        sessionContent: { cnavIdToken },
        externalIdentityId: decodedUserInfo.externalIdentityId,
        authenticationMethodRepository,
        userToCreateRepository,
      });
    });

    it('should raise an error and log details if required properties are not returned by Cnav external API', async function () {
      // given
      const authenticationKey = 'authenticationKey';
      const cnavIdToken = 'idToken';
      authenticationSessionService.getByKey.resolves({ cnavIdToken });
      authenticationServiceRegistry.lookupAuthenticationService.resolves(cnavAuthenticationService);

      const decodedUserInfo = {
        firstName: 'Jean',
        lastName: undefined,
        externalIdentityId: 'externalIdentityId',
        nonce: 'nonce',
      };

      cnavAuthenticationService.getUserInfo.resolves(decodedUserInfo);

      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(createUserFromExternalIdp)({
        authenticationKey,
        authenticationSessionService,
        authenticationServiceRegistry,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      expect(error).to.be.instanceOf(InvalidExternalAPIResponseError);
      expect(error.message).to.be.equal('Les informations utilisateurs récupérées sont incorrectes.');
      const expectedMessage = `Un des champs obligatoires n'a pas été renvoyé : ${JSON.stringify(decodedUserInfo)}.`;
      expect(logger.error).to.have.been.calledWith(expectedMessage);
    });
  });
});
