const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const authenticatePoleEmploiUser = require('../../../../lib/domain/usecases/authenticate-pole-emploi-user');

const User = require('../../../../lib/domain/models/User');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const { UnexpectedUserAccount, UserAccountNotFoundForPoleEmploiError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const moment = require('moment');

describe('Unit | Application | Use Case | authenticate-pole-emploi-user', function() {

  const code = 'code';
  const redirectUri = 'redirectUri';
  const clientId = 'clientId';

  const accessToken = 'accessToken';
  const idToken = 'idToken';
  const expiresIn = 60;
  const refreshToken = 'refreshToken';

  const firstName = 'firstname';
  const lastName = 'lastname';
  const externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

  const userId = 1;
  const domainTransaction = Symbol();

  let authenticationService;
  let tokenService;
  let authenticationCache;

  let userRepository;
  let authenticationMethodRepository;

  let userInfo;
  let clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers(Date.now());
    userInfo = {
      family_name: lastName,
      given_name: firstName,
      externalIdentityId,
    };

    authenticationCache = {
      set: sinon.stub().resolves() };

    authenticationService = {
      generatePoleEmploiTokens: sinon.stub().resolves({ accessToken, idToken, expiresIn, refreshToken }),
      getPoleEmploiUserInfo: sinon.stub().resolves(userInfo),
    };

    tokenService = {
      createAccessTokenFromUser: sinon.stub().returns(),
    };

    userRepository = {
      findByPoleEmploiExternalIdentifier: sinon.stub().resolves({}),
    };

    authenticationMethodRepository = {
      create: sinon.stub().resolves(),
      updatePoleEmploiAuthenticationComplementByUserId: sinon.stub().resolves(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };
  });

  afterEach(function() {
    clock.restore();
  });

  context('When user has an account', function() {

    it('should call authenticate pole emploi user with code, redirectUri and clientId parameters', async function() {
      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId, authenticatedUserId: userId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(authenticationService.generatePoleEmploiTokens).to.have.been.calledWith({ code, redirectUri, clientId });
    });

    it('should call get pole emploi user info with id token parameter', async function() {
      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId, authenticatedUserId: userId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(authenticationService.getPoleEmploiUserInfo).to.have.been.calledWith(idToken);
    });

    it('should call tokenService createAccessTokenFromUser function with external source and user parameters', async function() {
      // given
      const user = new User({ id: userId, firstName, lastName });
      user.externalIdentityId = externalIdentityId;

      userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: userId });

      // when
      await authenticatePoleEmploiUser({
        code, redirectUri, clientId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(tokenService.createAccessTokenFromUser).to.have.been.calledWith(userId, 'pole_emploi_connect');
    });

    it('should return accessToken and idToken', async function() {
      // given
      const expectedResult = {
        access_token: accessToken,
        id_token: idToken,
      };

      tokenService.createAccessTokenFromUser.returns(accessToken);

      // when
      const result = await authenticatePoleEmploiUser({
        code, redirectUri, clientId, authenticatedUserId: userId,
        userRepository, authenticationMethodRepository, authenticationService, tokenService,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    context('When user has an pole emploi authentication method', function() {

      it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async function() {
        // given
        userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: 1 });
        const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken,
          refreshToken,
          expiredDate: moment().add(expiresIn, 's').toDate(),
        });

        // when
        await authenticatePoleEmploiUser({
          code, redirectUri, clientId,
          userRepository, authenticationMethodRepository, authenticationService, tokenService,
        });

        // then
        expect(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId).to.have.been.calledWith({ authenticationComplement: expectedAuthenticationComplement, userId });
      });
    });

    context('When user is connected with Pix authentication method', function() {

      context('When the user does not have a pole emploi authentication method', function() {

        it('should call authentication method repository create function with pole emploi authentication method in domain transaction', async function() {
          // given
          const userInfo = {
            firstName, lastName, externalIdentityId,
          };

          authenticationService.getPoleEmploiUserInfo.resolves(userInfo);
          userRepository.findByPoleEmploiExternalIdentifier.resolves(null);
          const expectedAuthenticationMethod = new AuthenticationMethod({
            identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
            externalIdentifier: externalIdentityId,
            authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
              accessToken,
              refreshToken,
              expiredDate: moment().add(expiresIn, 's').toDate(),
            }),
            userId,
          });

          // when
          await authenticatePoleEmploiUser({
            code, redirectUri, clientId, authenticatedUserId: userId,
            userRepository, authenticationMethodRepository, authenticationService, tokenService,
          });

          // then
          expect(authenticationMethodRepository.create).to.have.been.calledWith({ authenticationMethod: expectedAuthenticationMethod });
        });
      });

      context('When the user does have a pole emploi authentication method', function() {

        it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async function() {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(domainBuilder.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
            externalIdentifier: userInfo.externalIdentityId,
          }));
          const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
            accessToken,
            refreshToken,
            expiredDate: moment().add(expiresIn, 's').toDate(),
          });

          // when
          await authenticatePoleEmploiUser({
            code, redirectUri, clientId, authenticatedUserId: userId,
            userRepository, authenticationMethodRepository, authenticationService, tokenService,
          });

          // then
          expect(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId).to.have.been.calledWith({ authenticationComplement: expectedAuthenticationComplement, userId });
        });

        it('should throw an UnexpectedUserAccount error if the external identifier does not match the one in the pole emploi id token', async function() {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(domainBuilder.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
            externalIdentifier: 'other_external_identifier',
          }));

          // when
          const error = await catchErr(authenticatePoleEmploiUser)({
            code, redirectUri, clientId, authenticatedUserId: userId,
            userRepository, authenticationMethodRepository, authenticationService, tokenService,
          });

          // then
          expect(error).to.be.instanceOf(UnexpectedUserAccount);
        });
      });
    });
  });

  context('When user has no account', function() {

    it('should throw an UserAccountNotFoundForPoleEmploiError', async function() {
      // given
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);

      // when
      const error = await catchErr(authenticatePoleEmploiUser)({
        code, redirectUri, clientId,
        userRepository, authenticationMethodRepository,
        authenticationService, tokenService, authenticationCache,
      });

      // then
      expect(error).to.be.instanceOf(UserAccountNotFoundForPoleEmploiError);
    });

    it('should call set Authentication Cache function', async function() {
      // given
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);
      const expectedObject = { accessToken, idToken, expiresIn, refreshToken };
      authenticationCache.set.resolves(expectedObject);

      // when
      await catchErr(authenticatePoleEmploiUser)({
        code, redirectUri, clientId,
        userRepository, authenticationMethodRepository,
        authenticationService, tokenService, authenticationCache,
      });

      // then
      expect(authenticationCache.set).to.have.been.called;
    });
  });
});
