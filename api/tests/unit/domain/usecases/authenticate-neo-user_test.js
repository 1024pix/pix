const moment = require('moment');

const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const NeoTokens = require('../../../../lib/domain/models/NeoTokens');
const User = require('../../../../lib/domain/models/User');

const { UnexpectedNeoStateError, UnexpectedUserAccountError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const logger = require('../../../../lib/infrastructure/logger');

const authenticateNeoUser = require('../../../../lib/domain/usecases/authenticate-neo-user');

describe('Unit | UseCase | authenticate-neo-user', function () {
  let authenticationService;
  let tokenService;

  let authenticationMethodRepository;
  let neoTokensRepository;
  let userRepository;

  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(Date.now());

    authenticationService = {
      generateNeoTokens: sinon.stub(),
      getNeoUserInfo: sinon.stub(),
    };

    tokenService = {
      createAccessTokenForNeo: sinon.stub().returns(),
    };

    authenticationMethodRepository = {
      create: sinon.stub().resolves(),
      updateNeoAuthenticationComplementByUserId: sinon.stub().resolves(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    neoTokensRepository = {
      save: sinon.stub(),
    };

    userRepository = {
      findByNeoExternalIdentifier: sinon.stub().resolves({}),
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
    it('should throw an UnexpectedNeoStateError', async function () {
      // given
      const stateSent = 'stateSent';
      const stateReceived = 'stateReceived';
      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(authenticateNeoUser)({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived,
        stateSent,
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnexpectedNeoStateError);
      expect(logger.error).to.have.been.calledWith(
        `State sent ${stateSent} did not match the state received ${stateReceived}`
      );
    });
  });

  context('When user has an account', function () {
    it('should call authenticate Neo user with code, redirectUri and clientId parameters', async function () {
      // given
      _fakeNeoAPI({ authenticationService });
      tokenService.createAccessTokenForNeo.returns('access-token');

      // when
      await authenticateNeoUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      expect(authenticationService.generateNeoTokens).to.have.been.calledWith({
        code: 'code',
        redirectUri: 'redirectUri',
        clientId: 'clientId',
      });
    });

    it('should call get Neo user info with id token parameter', async function () {
      // given
      _fakeNeoAPI({ authenticationService });
      tokenService.createAccessTokenForNeo.returns('access-token');

      // when
      await authenticateNeoUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      expect(authenticationService.getNeoUserInfo).to.have.been.calledWith('neoAccessToken');
    });

    it('should call tokenService createAccessTokenForNeo function with user id', async function () {
      // given
      const user = new User({ id: 1, firstName: 'Tuck', lastName: 'Morris' });
      user.externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';
      tokenService.createAccessTokenForNeo.returns('access-token');

      _fakeNeoAPI({ authenticationService });
      userRepository.findByNeoExternalIdentifier.resolves({ id: 1 });

      // when
      await authenticateNeoUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      expect(tokenService.createAccessTokenForNeo).to.have.been.calledWith(1);
    });

    it('should return accessToken and idToken', async function () {
      // given
      const { neoTokens } = _fakeNeoAPI({ authenticationService });
      const authenticatedUserId = 1;
      tokenService.createAccessTokenForNeo.withArgs(authenticatedUserId).returns('access-token');

      // when
      const result = await authenticateNeoUser({
        authenticatedUserId,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      const expectedResult = {
        pixAccessToken: 'access-token',
        neoTokens,
      };
      expect(result).to.deep.equal(expectedResult);
    });

    it('should save last logged at date', async function () {
      // given
      _fakeNeoAPI({ authenticationService });
      tokenService.createAccessTokenForNeo.returns('access-token');

      // when
      await authenticateNeoUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 1 });
    });

    context('When user has an Neo authentication method', function () {
      it('should call authentication repository updateNeoAuthenticationComplementByUserId function', async function () {
        // given
        userRepository.findByNeoExternalIdentifier.resolves({ id: 1 });
        const { neoTokens } = _fakeNeoAPI({ authenticationService });
        tokenService.createAccessTokenForNeo.returns('access-token');

        // when
        await authenticateNeoUser({
          authenticatedUserId: undefined,
          clientId: 'clientId',
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          authenticationService,
          tokenService,
          authenticationMethodRepository,
          neoTokensRepository,
          userRepository,
        });

        // then
        const expectedAuthenticationComplement = new AuthenticationMethod.NeoAuthenticationComplement({
          accessToken: neoTokens.accessToken,
          refreshToken: neoTokens.refreshToken,
          expiredDate: moment().add(neoTokens.expiresIn, 's').toDate(),
        });
        expect(authenticationMethodRepository.updateNeoAuthenticationComplementByUserId).to.have.been.calledWith(
          {
            authenticationComplement: expectedAuthenticationComplement,
            userId: 1,
          }
        );
      });

      it('should also save last logged at date', async function () {
        // given
        userRepository.findByNeoExternalIdentifier.resolves({ id: 123 });
        _fakeNeoAPI({ authenticationService });
        tokenService.createAccessTokenForNeo.returns('access-token');

        // when
        await authenticateNeoUser({
          authenticatedUserId: undefined,
          clientId: 'clientId',
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          authenticationService,
          tokenService,
          authenticationMethodRepository,
          neoTokensRepository,
          userRepository,
        });

        // then
        expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 123 });
      });
    });

    context('When user is connected with Pix authentication method', function () {
      context('When the user does not have a Neo authentication method', function () {
        it('should call authentication method repository create function with Neo authentication method in domain transaction', async function () {
          // given
          const { neoTokens } = _fakeNeoAPI({ authenticationService });
          userRepository.findByNeoExternalIdentifier.resolves(null);
          tokenService.createAccessTokenForNeo.returns('access-token');

          // when
          await authenticateNeoUser({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            neoTokensRepository,
            userRepository,
          });

          // then
          const expectedAuthenticationMethod = new AuthenticationMethod({
            identityProvider: AuthenticationMethod.identityProviders.NEO,
            externalIdentifier: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            authenticationComplement: new AuthenticationMethod.NeoAuthenticationComplement({
              accessToken: neoTokens.accessToken,
              refreshToken: neoTokens.refreshToken,
              expiredDate: moment().add(neoTokens.expiresIn, 's').toDate(),
            }),
            userId: 1,
          });
          expect(authenticationMethodRepository.create).to.have.been.calledWith({
            authenticationMethod: expectedAuthenticationMethod,
          });
        });
      });

      context('When the user does have a Neo authentication method', function () {
        it('should call authentication repository updateNeoAuthenticationComplementByUserId function', async function () {
          // given
          const { neoTokens } = _fakeNeoAPI({ authenticationService });
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(
            domainBuilder.buildAuthenticationMethod.withNeoAsIdentityProvider({
              externalIdentifier: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            })
          );
          tokenService.createAccessTokenForNeo.returns('access-token');

          // when
          await authenticateNeoUser({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            neoTokensRepository,
            userRepository,
          });

          // then
          const expectedAuthenticationComplement = new AuthenticationMethod.NeoAuthenticationComplement({
            accessToken: neoTokens.accessToken,
            refreshToken: neoTokens.refreshToken,
            expiredDate: moment().add(neoTokens.expiresIn, 's').toDate(),
          });
          expect(
            authenticationMethodRepository.updateNeoAuthenticationComplementByUserId
          ).to.have.been.calledWith({
            authenticationComplement: expectedAuthenticationComplement,
            userId: 1,
          });
        });

        it('should throw an UnexpectedUserAccountError error if the external identifier does not match the one in the Neo id token', async function () {
          // given
          _fakeNeoAPI({ authenticationService });

          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(
            domainBuilder.buildAuthenticationMethod.withNeoAsIdentityProvider({
              externalIdentifier: 'other_external_identifier',
            })
          );

          // when
          const error = await catchErr(authenticateNeoUser)({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
            authenticationService,
            tokenService,
            authenticationMethodRepository,
            neoTokensRepository,
            userRepository,
          });

          // then
          expect(error).to.be.instanceOf(UnexpectedUserAccountError);
        });
      });
    });
  });

  context('When user has no account', function () {
    it('should call neoTokens repository save method', async function () {
      // given
      const { neoTokens } = _fakeNeoAPI({ authenticationService });
      const key = 'aaa-bbb-ccc';
      neoTokensRepository.save.resolves(key);
      userRepository.findByNeoExternalIdentifier.resolves(null);

      // when
      await authenticateNeoUser({
        authenticatedUserId: undefined,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      expect(neoTokensRepository.save).to.have.been.calledWith(neoTokens);
    });

    it('should return an authenticationKey', async function () {
      // given
      const key = 'aaa-bbb-ccc';
      _fakeNeoAPI({ authenticationService });
      neoTokensRepository.save.resolves(key);
      userRepository.findByNeoExternalIdentifier.resolves(null);

      // when
      const result = await authenticateNeoUser({
        authenticatedUserId: undefined,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        authenticationService,
        tokenService,
        authenticationMethodRepository,
        neoTokensRepository,
        userRepository,
      });

      // then
      expect(result.authenticationKey).to.equal(key);
    });
  });
});

function _fakeNeoAPI({ authenticationService }) {
  const neoTokens = new NeoTokens({
    accessToken: 'neoAccessToken',
    expiresIn: 60,
    refreshToken: 'refreshToken',
  });
  const userInfo = {
    family_name: 'Morris',
    given_name: 'Tuck',
    externalIdentityId: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
  };

  authenticationService.generateNeoTokens.resolves(neoTokens);
  authenticationService.getNeoUserInfo.resolves(userInfo);

  return { neoTokens };
}
