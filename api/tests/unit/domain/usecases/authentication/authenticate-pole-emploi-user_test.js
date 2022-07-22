const moment = require('moment');

const { expect, sinon, domainBuilder, catchErr } = require('../../../../test-helper');

const AuthenticationMethod = require('../../../../../lib/domain/models/AuthenticationMethod');
const AuthenticationSessionContent = require('../../../../../lib/domain/models/AuthenticationSessionContent');

const { UnexpectedOidcStateError, UnexpectedUserAccountError } = require('../../../../../lib/domain/errors');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');
const logger = require('../../../../../lib/infrastructure/logger');

const authenticatePoleEmploiUser = require('../../../../../lib/domain/usecases/authentication/authenticate-pole-emploi-user');

describe('Unit | UseCase | authenticate-pole-emploi-user', function () {
  let poleEmploiAuthenticationService;
  let authenticationSessionService;
  let oidcAuthenticationService;
  let authenticationMethodRepository;
  let userRepository;

  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(Date.now());

    poleEmploiAuthenticationService = {
      getUserInfo: sinon.stub(),
      saveIdToken: sinon.stub(),
    };
    poleEmploiAuthenticationService.saveIdToken
      .withArgs({ idToken: 'idToken', userId: 1 })
      .resolves('ce945751-b7f5-4786-8979-63e25a4f182b');

    authenticationMethodRepository = {
      create: sinon.stub().resolves(),
      updatePoleEmploiAuthenticationComplementByUserId: sinon.stub().resolves(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    authenticationSessionService = {
      save: sinon.stub(),
    };

    oidcAuthenticationService = {
      createAccessToken: sinon.stub(),
      exchangeCodeForTokens: sinon.stub(),
    };

    userRepository = {
      findByExternalIdentifier: sinon.stub().resolves({}),
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
    it('should throw an UnexpectedOidcStateError', async function () {
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
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnexpectedOidcStateError);
      expect(logger.error).to.have.been.calledWith(
        `State sent ${stateSent} did not match the state received ${stateReceived}`
      );
    });
  });

  context('When user has an account', function () {
    it('should call authenticate pole emploi user with code and redirectUri parameters', async function () {
      // given
      _fakePoleEmploiAPI({ poleEmploiAuthenticationService, oidcAuthenticationService });

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(oidcAuthenticationService.exchangeCodeForTokens).to.have.been.calledWith({
        code: 'code',
        redirectUri: 'redirectUri',
      });
    });

    it('should call get pole emploi user info with id token parameter', async function () {
      // given
      _fakePoleEmploiAPI({ poleEmploiAuthenticationService, oidcAuthenticationService });

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(poleEmploiAuthenticationService.getUserInfo).to.have.been.calledWith({ idToken: 'idToken' });
    });

    it('should return accessToken and logoutUrlUUID', async function () {
      // given
      _fakePoleEmploiAPI({
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
      });
      const authenticatedUserId = 1;

      oidcAuthenticationService.createAccessToken.withArgs(1).resolves('access-token');

      // when
      const result = await authenticatePoleEmploiUser({
        authenticatedUserId,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      const expectedResult = {
        pixAccessToken: 'access-token',
        logoutUrlUUID: 'ce945751-b7f5-4786-8979-63e25a4f182b',
      };
      expect(result).to.deep.equal(expectedResult);
    });

    it('should save last logged at date', async function () {
      // given
      _fakePoleEmploiAPI({ poleEmploiAuthenticationService, oidcAuthenticationService });

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: 1,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 1 });
    });

    context('When user has an pole emploi authentication method', function () {
      it('should call authentication repository updatePoleEmploiAuthenticationComplementByUserId function', async function () {
        // given
        userRepository.findByExternalIdentifier.resolves({ id: 1 });
        const { poleEmploiAuthenticationSessionContent } = _fakePoleEmploiAPI({
          poleEmploiAuthenticationService,
          oidcAuthenticationService,
        });

        // when
        await authenticatePoleEmploiUser({
          authenticatedUserId: undefined,
          clientId: 'clientId',
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          poleEmploiAuthenticationService,
          oidcAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken: poleEmploiAuthenticationSessionContent.accessToken,
          refreshToken: poleEmploiAuthenticationSessionContent.refreshToken,
          expiredDate: moment().add(poleEmploiAuthenticationSessionContent.expiresIn, 's').toDate(),
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
        userRepository.findByExternalIdentifier.resolves({ id: 123 });
        _fakePoleEmploiAPI({ poleEmploiAuthenticationService, oidcAuthenticationService });

        // when
        await authenticatePoleEmploiUser({
          authenticatedUserId: undefined,
          clientId: 'clientId',
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          poleEmploiAuthenticationService,
          oidcAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
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
          const { poleEmploiAuthenticationSessionContent } = _fakePoleEmploiAPI({
            poleEmploiAuthenticationService,
            oidcAuthenticationService,
          });
          userRepository.findByExternalIdentifier.resolves(null);

          // when
          await authenticatePoleEmploiUser({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
            poleEmploiAuthenticationService,
            oidcAuthenticationService,
            authenticationSessionService,
            authenticationMethodRepository,
            userRepository,
          });

          // then
          const expectedAuthenticationMethod = new AuthenticationMethod({
            identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
            externalIdentifier: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
              accessToken: poleEmploiAuthenticationSessionContent.accessToken,
              refreshToken: poleEmploiAuthenticationSessionContent.refreshToken,
              expiredDate: moment().add(poleEmploiAuthenticationSessionContent.expiresIn, 's').toDate(),
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
          const { poleEmploiAuthenticationSessionContent } = _fakePoleEmploiAPI({
            poleEmploiAuthenticationService,
            oidcAuthenticationService,
          });
          authenticationMethodRepository.findOneByUserIdAndIdentityProvider.resolves(
            domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
              externalIdentifier: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            })
          );

          // when
          await authenticatePoleEmploiUser({
            authenticatedUserId: 1,
            clientId: 'clientId',
            code: 'code',
            redirectUri: 'redirectUri',
            stateReceived: 'state',
            stateSent: 'state',
            poleEmploiAuthenticationService,
            oidcAuthenticationService,
            authenticationSessionService,
            authenticationMethodRepository,
            userRepository,
          });

          // then
          const expectedAuthenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
            accessToken: poleEmploiAuthenticationSessionContent.accessToken,
            refreshToken: poleEmploiAuthenticationSessionContent.refreshToken,
            expiredDate: moment().add(poleEmploiAuthenticationSessionContent.expiresIn, 's').toDate(),
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
          _fakePoleEmploiAPI({ poleEmploiAuthenticationService, oidcAuthenticationService });

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
            poleEmploiAuthenticationService,
            oidcAuthenticationService,
            authenticationSessionService,
            authenticationMethodRepository,
            userRepository,
          });

          // then
          expect(error).to.be.instanceOf(UnexpectedUserAccountError);
        });
      });
    });
  });

  context('When user has no account', function () {
    it('should call AuthenticationSessionContent repository save method', async function () {
      // given
      const { poleEmploiAuthenticationSessionContent } = _fakePoleEmploiAPI({
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
      });
      const key = 'aaa-bbb-ccc';
      authenticationSessionService.save.resolves(key);
      userRepository.findByExternalIdentifier.resolves(null);

      // when
      await authenticatePoleEmploiUser({
        authenticatedUserId: undefined,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(authenticationSessionService.save).to.have.been.calledWith(poleEmploiAuthenticationSessionContent);
    });

    it('should return an authenticationKey', async function () {
      // given
      const key = 'aaa-bbb-ccc';
      _fakePoleEmploiAPI({ poleEmploiAuthenticationService, oidcAuthenticationService });
      authenticationSessionService.save.resolves(key);
      userRepository.findByExternalIdentifier.resolves(null);

      // when
      const result = await authenticatePoleEmploiUser({
        authenticatedUserId: undefined,
        clientId: 'clientId',
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        poleEmploiAuthenticationService,
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(result.authenticationKey).to.equal(key);
    });
  });
});

function _fakePoleEmploiAPI({ poleEmploiAuthenticationService, oidcAuthenticationService }) {
  const poleEmploiAuthenticationSessionContent = new AuthenticationSessionContent({
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

  oidcAuthenticationService.exchangeCodeForTokens.resolves(poleEmploiAuthenticationSessionContent);
  poleEmploiAuthenticationService.getUserInfo.resolves(userInfo);

  return { poleEmploiAuthenticationSessionContent };
}
