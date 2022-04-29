const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const { UnexpectedStateError } = require('../../../../lib/domain/errors');
const logger = require('../../../../lib/infrastructure/logger');

const authenticateCnavUser = require('../../../../lib/domain/usecases/authenticate-cnav-user');

describe('Unit | UseCase | authenticate-cnav-user', function () {
  let cnavAuthenticationService;
  let authenticationSessionService;
  let authenticationMethodRepository;
  let userRepository;

  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(Date.now());

    cnavAuthenticationService = {
      exchangeCodeForIdToken: sinon.stub(),
      getUserInfo: sinon.stub(),
      createAccessToken: sinon.stub().returns(),
    };

    authenticationMethodRepository = {
      create: sinon.stub().resolves(),
      findOneByUserIdAndIdentityProvider: sinon.stub(),
    };

    authenticationSessionService = {
      save: sinon.stub(),
    };

    userRepository = {
      findByCnavExternalIdentifier: sinon.stub().resolves({}),
      updateLastLoggedAt: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('When the request state does not match the response state', function () {
    it('should throw an UnexpectedStateError', async function () {
      // given
      const stateSent = 'stateSent';
      const stateReceived = 'stateReceived';
      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(authenticateCnavUser)({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived,
        stateSent,
        cnavAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnexpectedStateError);
      expect(logger.error).to.have.been.calledWith(
        `State sent ${stateSent} did not match the state received ${stateReceived}`
      );
    });
  });

  context('When user has an account', function () {
    context('When user has an Cnav authentication method', function () {
      it('should create a Pix access token', async function () {
        // given
        const user = domainBuilder.buildUser().id;
        domainBuilder.buildAuthenticationMethod.withCnavAsIdentityProvider({
          userId: user.id,
        });

        _fakeCnavAPI({ cnavAuthenticationService });
        userRepository.findByCnavExternalIdentifier.resolves(user);

        // when
        await authenticateCnavUser({
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          cnavAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(cnavAuthenticationService.createAccessToken).to.have.been.calledWith(user.id);
      });

      it('should save last logged at date', async function () {
        // given
        userRepository.findByCnavExternalIdentifier.resolves({ id: 123 });
        _fakeCnavAPI({ cnavAuthenticationService });
        cnavAuthenticationService.createAccessToken.returns('access-token');

        // when
        await authenticateCnavUser({
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          cnavAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: 123 });
      });

      it('should return Pix access token', async function () {
        // given
        const user = domainBuilder.buildUser().id;
        domainBuilder.buildAuthenticationMethod.withCnavAsIdentityProvider({
          userId: user.id,
        });

        _fakeCnavAPI({ cnavAuthenticationService });
        userRepository.findByCnavExternalIdentifier.resolves(user);
        cnavAuthenticationService.createAccessToken.returns('access-token');

        // when
        const result = await authenticateCnavUser({
          code: 'code',
          redirectUri: 'redirectUri',
          stateReceived: 'state',
          stateSent: 'state',
          cnavAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
        });

        // then
        expect(result).to.deep.equal({ pixAccessToken: 'access-token' });
      });
    });
  });

  context('When user has no account', function () {
    it('should save the id token', async function () {
      // given
      const idToken = _fakeCnavAPI({ cnavAuthenticationService });
      const key = 'aaa-bbb-ccc';
      authenticationSessionService.save.resolves(key);
      userRepository.findByCnavExternalIdentifier.resolves(null);

      // when
      await authenticateCnavUser({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        cnavAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(authenticationSessionService.save).to.have.been.calledWith(idToken);
    });

    it('should return an authentication key', async function () {
      // given
      const authenticationKey = 'aaa-bbb-ccc';
      _fakeCnavAPI({ cnavAuthenticationService });
      authenticationSessionService.save.resolves(authenticationKey);
      userRepository.findByCnavExternalIdentifier.resolves(null);

      // when
      const result = await authenticateCnavUser({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        cnavAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
      });

      // then
      expect(result).to.deep.equal({ authenticationKey });
    });
  });
});

function _fakeCnavAPI({ cnavAuthenticationService }) {
  const idToken = 'idToken';
  const userInfo = {
    family_name: 'Morris',
    given_name: 'Tuck',
    externalIdentityId: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
  };

  cnavAuthenticationService.exchangeCodeForIdToken.resolves(idToken);
  cnavAuthenticationService.getUserInfo.resolves(userInfo);

  return idToken;
}
