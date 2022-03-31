const moment = require('moment');

const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');
const User = require('../../../../lib/domain/models/User');

const { UnexpectedPoleEmploiStateError, UnexpectedUserAccountError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const logger = require('../../../../lib/infrastructure/logger');

const authenticatePoleEmploiUser = require('../../../../lib/domain/usecases/authenticate-pole-emploi-user');

describe('Unit | UseCase | authenticate-pole-emploi-user', function () {
  let authenticationService;
  let tokenService;

  let authenticationMethodRepository;
  let poleEmploiTokensRepository;
  let userRepository;

  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(Date.now());

    authenticationService = {
      exchangePoleEmploiCodeForTokens: sinon.stub(),
      getPoleEmploiUserInfo: sinon.stub(),
    };

    tokenService = {
      createAccessTokenForPoleEmploi: sinon.stub().returns(),
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
      updateLastLoggedAt: sinon.stub(),
    };

    const domainTransaction = Symbol();
    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('When the request state does not match the response state', function () {
    it('should throw an UnexpectedPoleEmploiStateError', async function () {
      // given
      const stateSent = 'stateSent';
      const stateReceived = 'stateReceived';
      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(authenticatePoleEmploiUser)({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
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
      expect(logger.error).to.have.been.calledWith(
        `State sent ${stateSent} did not match the state received ${stateReceived}`
      );
    });
  });

  context('When user has an account', function () {
    it('should call authenticate pole emploi user with code, redirectUri and clientId parameters', async function () {
      // given
      _fakePoleEmploiAPI({ authenticationService });
      tokenService.createAccessTokenForPoleEmploi.returns('access-token');

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(authenticationService.exchangePoleEmploiCodeForTokens).to.have.been.calledWith({
        code: 'code',
        redirectUri: 'redirectUri',
        clientId: 'clientId',
      });
    });

    it('should call get pole emploi user info with id token parameter', async function () {
      // given
      _fakePoleEmploiAPI({ authenticationService });
      tokenService.createAccessTokenForPoleEmploi.returns('access-token');

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(authenticationService.getPoleEmploiUserInfo).to.have.been.calledWith('idToken');
    });

    it('should call tokenService createAccessTokenForPoleEmploi function with user id', async function () {
      // given
      const user = new User({ id: 1, firstName: 'Tuck', lastName: 'Morris' });
      user.externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';
      tokenService.createAccessTokenForPoleEmploi.returns('access-token');

      _fakePoleEmploiAPI({ authenticationService });
      userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: 1 });

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(tokenService.createAccessTokenForPoleEmploi).to.have.been.calledWith(1);
    });

    it('should return accessToken and idToken', async function () {
      // given
      const { poleEmploiTokens } = _fakePoleEmploiAPI({ authenticationService });
      const authenticatedUserId = 1;
      tokenService.createAccessTokenForPoleEmploi.withArgs(authenticatedUserId).returns('access-token');

      // when
      const result = await authenticatePoleEmploiUser({
        authenticatedUserId,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      const expectedResult = {
        pixAccessToken: 'access-token',
        poleEmploiTokens,
      };
      expect(result).to.deep.equal(expectedResult);
    });

    it('should save last logged at date', async function () {
      // given
      _fakePoleEmploiAPI({ authenticationService });
      tokenService.createAccessTokenForPoleEmploi.returns('access-token');

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 1 });
    });

    context('When user has an pole emploi authentication method', function () {
      it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async function () {
        // given
        userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: 1 });
        const { poleEmploiTokens } = _fakePoleEmploiAPI({ authenticationService });
        tokenService.createAccessTokenForPoleEmploi.returns('access-token');

        // when
        await authenticatePoleEmploiUser({
          authenticatedUserId: undefined,
          clientId: 'clientId',
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          authenticationService,
          tokenService,
          authenticationMethodRepository,
          poleEmploiTokensRepository,
          userRepository,
        });

        // then
        const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken: poleEmploiTokens.accessToken,
          refreshToken: poleEmploiTokens.refreshToken,
          expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
        });
        expect(authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId).to.have.been.calledWith(
          {
            authenticationComplement: expectedAuthenticationComplement,
            userId: 1,
          }
        );
      });

      it('should also save last logged at date', async function () {
        // given
        userRepository.findByPoleEmploiExternalIdentifier.resolves({ id: 123 });
        _fakePoleEmploiAPI({ authenticationService });
        tokenService.createAccessTokenForPoleEmploi.returns('access-token');

        // when
        await authenticatePoleEmploiUser({
          authenticatedUserId: undefined,
          clientId: 'clientId',
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          authenticationService,
          tokenService,
          authenticationMethodRepository,
          poleEmploiTokensRepository,
          userRepository,
        });

        // then
        expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 123 });
      });
    });

    context('When user is connected with Pix authentication method', function () {
      context('When the user does not have a pole emploi authentication method', function () {
        it('should call authentication method repository create function with pole emploi authentication method in domain transaction', async function () {
          // given
          const { poleEmploiTokens } = _fakePoleEmploiAPI({ authenticationService });
          userRepository.findByPoleEmploiExternalIdentifier.resolves(null);
          tokenService.createAccessTokenForPoleEmploi.returns('access-token');

          // when
          await authenticatePoleEmploiUser({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            poleEmploiTokensRepository,
            userRepository,
          });

          // then
          const expectedAuthenticationMethod = new AuthenticationMethod({
            identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
            externalIdentifier: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
              accessToken: poleEmploiTokens.accessToken,
              refreshToken: poleEmploiTokens.refreshToken,
              expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
            }),
            userId: 1,
          });
          expect(authenticationMethodRepository.create).to.have.been.calledWith({
            authenticationMethod: expectedAuthenticationMethod,
          });
        });
      });

      context('When the user does have a pole emploi authentication method', function () {
        it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async function () {
          // given
          const { poleEmploiTokens } = _fakePoleEmploiAPI({ authenticationService });
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(
            domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
              externalIdentifier: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            })
          );
          tokenService.createAccessTokenForPoleEmploi.returns('access-token');

          // when
          await authenticatePoleEmploiUser({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            poleEmploiTokensRepository,
            userRepository,
          });

          // then
          const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
            accessToken: poleEmploiTokens.accessToken,
            refreshToken: poleEmploiTokens.refreshToken,
            expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
          });
          expect(
            authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId
          ).to.have.been.calledWith({
            authenticationComplement: expectedAuthenticationComplement,
            userId: 1,
          });
        });

        it('should throw an UnexpectedUserAccountError error if the external identifier does not match the one in the pole emploi id token', async function () {
          // given
          _fakePoleEmploiAPI({ authenticationService });

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(
            domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
              externalIdentifier: 'other_external_identifier',
            })
          );

          // when
          const error = await catchErr(authenticatePoleEmploiUser)({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
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

  context('When user has no account', function () {
    it('should call poleEmploiTokens repository save method', async function () {
      // given
      const { poleEmploiTokens } = _fakePoleEmploiAPI({ authenticationService });
      const key = 'aaa-bbb-ccc';
      poleEmploiTokensRepository.save.resolves(key);
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: undefined,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        poleEmploiTokensRepository,
        userRepository,
      });

      // then
      expect(poleEmploiTokensRepository.save).to.have.been.calledWith(poleEmploiTokens);
    });

    it('should return an authenticationKey', async function () {
      // given
      const key = 'aaa-bbb-ccc';
      _fakePoleEmploiAPI({ authenticationService });
      poleEmploiTokensRepository.save.resolves(key);
      userRepository.findByPoleEmploiExternalIdentifier.resolves(null);

      // when
      const result = await authenticatePoleEmploiUser({
        authenticatedUserId: undefined,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
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

function _fakePoleEmploiAPI({ authenticationService }) {
  const poleEmploiTokens = new PoleEmploiTokens({
    accessToken: 'poleEmploiAccessToken',
    expiresIn: 60,
    idToken: 'idToken',
    refreshToken: 'refreshToken',
  });
  const userInfo = {
    family_name: 'Morris',
    given_name: 'Tuck',
    externalIdentityId: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
  };

  authenticationService.exchangePoleEmploiCodeForTokens.resolves(poleEmploiTokens);
  authenticationService.getPoleEmploiUserInfo.resolves(userInfo);

  return { poleEmploiTokens };
}
