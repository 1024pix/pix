const moment = require('moment');

const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');
const User = require('../../../../lib/domain/models/User');

const {
  UnexpectedPoleEmploiStateError,
  UnexpectedUserAccountError,
} = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const logger = require('../../../../lib/infrastructure/logger');

const authenticatePoleEmploiUser = require('../../../../lib/domain/usecases/authenticate-pole-emploi-user');

describe('Unit | UseCase | authenticate-pole-emploi-user', () => {

  const code = 'code';
  const redirectUri = 'redirectUri';
  const clientId = 'clientId';
  const state = 'state';

  const pixAccessToken = 'pixAccessToken';

  const poleEmploiAccessToken = 'poleEmploiAccessToken';
  const idToken = 'idToken';
  const expiresIn = 60;
  const refreshToken = 'refreshToken';
  const poleEmploiTokens = new PoleEmploiTokens({
    accessToken: poleEmploiAccessToken,
    expiresIn,
    idToken,
    refreshToken,
  });

  const firstName = 'firstname';
  const lastName = 'lastname';
  const externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

  const userId = 1;
  const domainTransaction = Symbol();

  let authenticationService;
  let tokenService;

  let authenticationMethodRepository;
  let poleEmploiTokensRepository;
  let userRepository;

  let userInfo;
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers(Date.now());

    userInfo = {
      family_name: lastName,
      given_name: firstName,
      externalIdentityId,
    };

    authenticationService = {
      generatePoleEmploiTokens: sinon.stub().resolves(poleEmploiTokens),
      getPoleEmploiUserInfo: sinon.stub().resolves(userInfo),
    };

    tokenService = {
      createAccessTokenFromUser: sinon.stub().returns(),
    };

    authenticationMethodRepository = {
      create: sinon.stub().resolves(),
      updatePoleEmploiAuthenticationComplementByUserId: sinon.stub().resolves(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    poleEmploiTokensRepository = {
      save: sinon.stub(),
    };

    userRepository = {
      findByPoleEmploiExternalIdentifier: sinon.stub().resolves({}),
    };

    DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };
  });

  afterEach(() => {
    clock.restore();
  });

  context('When the request state does not match the response state', () => {

    it('should throw an UnexpectedPoleEmploiStateError', async () => {
      // given
      const stateSent = 'stateSent';
      const stateReceived = 'stateReceived';
      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(authenticatePoleEmploiUser)({
        authenticatedUserId: userId,
        clientId,
        code,
        redirectUri,
        stateReceived,
        stateSent,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnexpectedPoleEmploiStateError);
      expect(logger.error).to.have.been.calledWith(`State sent ${stateSent} did not match the state received ${stateReceived}`);
    });
  });

  context('When user has an account', () => {

    it('should call authenticate pole emploi user with code, redirectUri and clientId parameters', async () => {
      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: userId,
        clientId,
        code,
        redirectUri,
        stateReceived: state,
        stateSent: state,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(authenticationService.generatePoleEmploiTokens).to.have.been.calledWith({
        code, redirectUri, clientId,
      });
    });

    it('should call get pole emploi user info with id token parameter', async () => {
      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: userId,
        clientId,
        code,
        redirectUri,
        stateReceived: state,
        stateSent: state,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(authenticationService.getPoleEmploiUserInfo).to.have.been.calledWith(idToken);
    });

    it('should call tokenService createAccessTokenFromUser function with external source and user parameters', async () => {
      // given
      const user = new User({ id: userId, firstName, lastName });
      user.externalIdentityId = externalIdentityId;

      userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: userId });

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: userId,
        clientId,
        code,
        redirectUri,
        stateReceived: state,
        stateSent: state,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(tokenService.createAccessTokenFromUser).to.have.been.calledWith(userId, 'pole_emploi_connect');
    });

    it('should return accessToken and idToken', async () => {
      // given
      const expectedResult = {
        pixAccessToken,
        poleEmploiTokens,
      };

      tokenService.createAccessTokenFromUser.returns(pixAccessToken);

      // when
      const result = await authenticatePoleEmploiUser({
        authenticatedUserId: userId,
        clientId,
        code,
        redirectUri,
        stateReceived: state,
        stateSent: state,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(result).to.deep.equal(expectedResult);
    });

    context('When user has an pole emploi authentication method', () => {

      it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async () => {
        // given
        userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: userId });
        const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken: poleEmploiTokens.accessToken,
          refreshToken: poleEmploiTokens.refreshToken,
          expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
        });

        // when
        await authenticatePoleEmploiUser({
          authenticatedUserId: undefined,
          clientId,
          code,
          redirectUri,
          stateReceived: state,
          stateSent: state,
          authenticationService,
          tokenService,
          authenticationMethodRepository,
          poleEmploiTokensRepository,
          userRepository,
        });

        // then
        expect(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId).to.have.been.calledWith({
          authenticationComplement: expectedAuthenticationComplement,
          userId,
        });
      });
    });

    context('When user is connected with Pix authentication method', () => {

      context('When the user does not have a pole emploi authentication method', () => {

        it('should call authentication method repository create function with pole emploi authentication method in domain transaction', async () => {
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
              accessToken: poleEmploiTokens.accessToken,
              refreshToken: poleEmploiTokens.refreshToken,
              expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
            }),
            userId,
          });

          // when
          await authenticatePoleEmploiUser({
            authenticatedUserId: userId,
            clientId,
            code,
            redirectUri,
            stateReceived: state,
            stateSent: state,
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            poleEmploiTokensRepository,
            userRepository,
          });

          // then
          expect(authenticationMethodRepository.create).to.have.been.calledWith({
            authenticationMethod: expectedAuthenticationMethod,
          });
        });
      });

      context('When the user does have a pole emploi authentication method', () => {

        it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async () => {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(domainBuilder.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
            externalIdentifier: userInfo.externalIdentityId,
          }));
          const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
            accessToken: poleEmploiTokens.accessToken,
            refreshToken: poleEmploiTokens.refreshToken,
            expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
          });

          // when
          await authenticatePoleEmploiUser({
            authenticatedUserId: userId,
            clientId,
            code,
            redirectUri,
            stateReceived: state,
            stateSent: state,
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            poleEmploiTokensRepository,
            userRepository,
          });

          // then
          expect(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId)
            .to.have.been.calledWith({
              authenticationComplement: expectedAuthenticationComplement,
              userId,
            });
        });

        it('should throw an UnexpectedUserAccountError error if the external identifier does not match the one in the pole emploi id token', async () => {
          // given
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(domainBuilder.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
            externalIdentifier: 'other_external_identifier',
          }));

          // when
          const error = await catchErr(authenticatePoleEmploiUser)({
            authenticatedUserId: userId,
            clientId,
            code,
            redirectUri,
            stateReceived: state,
            stateSent: state,
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            poleEmploiTokensRepository,
            userRepository,
          });

          // then
          expect(error).to.be.instanceOf(UnexpectedUserAccountError);
        });
      });
    });
  });

  context('When user has no account', () => {

    it('should call poleEmploiTokens repository save method', async () => {
      // given
      const key = 'aaa-bbb-ccc';
      poleEmploiTokensRepository.save.resolves(key);
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: undefined,
        clientId,
        code,
        redirectUri,
        stateReceived: state,
        stateSent: state,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(poleEmploiTokensRepository.save).to.have.been.calledWith(poleEmploiTokens);
    });

    it('should return an authenticationKey', async () => {
      // given
      const key = 'aaa-bbb-ccc';
      poleEmploiTokensRepository.save.resolves(key);
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);

      // when
      const result = await authenticatePoleEmploiUser({
        authenticatedUserId: undefined,
        clientId,
        code,
        redirectUri,
        stateReceived: state,
        stateSent: state,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(result.authenticationKey).to.equal(key);
    });
  });
});
