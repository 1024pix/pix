const { expect, sinon, catchErr, domainBuilder } = require('../../../../test-helper');
const { UnexpectedOidcStateError } = require('../../../../../lib/domain/errors');
const logger = require('../../../../../lib/infrastructure/logger');

const authenticateCnavUser = require('../../../../../lib/domain/usecases/authentication/authenticate-cnav-user');

describe('Unit | UseCase | authenticate-cnav-user', function () {
  let cnavAuthenticationService;
  let authenticationSessionService;
  let userRepository;

  beforeEach(function () {
    cnavAuthenticationService = {
      exchangeCodeForIdToken: sinon.stub(),
      getUserInfo: sinon.stub(),
      createAccessToken: sinon.stub().returns(),
    };

    authenticationSessionService = {
      save: sinon.stub(),
    };

    userRepository = {
      findByExternalIdentifier: sinon.stub(),
      updateLastLoggedAt: sinon.stub(),
    };
  });

  context('When the request state does not match the response state', function () {
    it('should throw an UnexpectedOidcStateError', async function () {
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
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnexpectedOidcStateError);
      expect(logger.error).to.have.been.calledWith(
        `State sent ${stateSent} did not match the state received ${stateReceived}`
      );
    });
  });

  context('When user has an pix account', function () {
    it('should create a pix access token', async function () {
      // given
      const user = domainBuilder.buildUser().id;
      domainBuilder.buildAuthenticationMethod.withCnavAsIdentityProvider({
        userId: user.id,
      });
      _fakeCnavAPI({ cnavAuthenticationService });
      userRepository.findByExternalIdentifier.resolves(user);

      // when
      await authenticateCnavUser({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        cnavAuthenticationService,
        authenticationSessionService,
        userRepository,
      });

      // then
      expect(cnavAuthenticationService.createAccessToken).to.have.been.calledWith(user.id);
    });

    it('should save last logged at date', async function () {
      // given
      const user = domainBuilder.buildUser().id;
      domainBuilder.buildAuthenticationMethod.withCnavAsIdentityProvider({
        userId: user.id,
      });
      _fakeCnavAPI({ cnavAuthenticationService });
      userRepository.findByExternalIdentifier.resolves(user);
      cnavAuthenticationService.createAccessToken.returns('access-token');

      // when
      await authenticateCnavUser({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        cnavAuthenticationService,
        authenticationSessionService,
        userRepository,
      });

      // then
      expect(userRepository.updateLastLoggedAt).to.have.been.calledWith({ userId: user.id });
    });

    it('should return pix access token', async function () {
      // given
      const user = domainBuilder.buildUser().id;
      domainBuilder.buildAuthenticationMethod.withCnavAsIdentityProvider({
        userId: user.id,
      });
      const pixAccessToken = 'access-token';

      _fakeCnavAPI({ cnavAuthenticationService });
      userRepository.findByExternalIdentifier.resolves(user);
      cnavAuthenticationService.createAccessToken.returns(pixAccessToken);

      // when
      const result = await authenticateCnavUser({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        cnavAuthenticationService,
        authenticationSessionService,
        userRepository,
      });

      // then
      expect(result).to.deep.equal({ pixAccessToken, isAuthenticationComplete: true });
    });
  });

  context('When user has no account', function () {
    it('should save the id token', async function () {
      // given
      const idToken = _fakeCnavAPI({ cnavAuthenticationService });
      userRepository.findByExternalIdentifier.resolves(null);

      // when
      await catchErr(authenticateCnavUser)({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        cnavAuthenticationService,
        authenticationSessionService,
        userRepository,
      });

      // then
      expect(authenticationSessionService.save).to.have.been.calledWith(idToken);
    });

    it('should return an authentication key', async function () {
      // given
      const authenticationKey = 'aaa-bbb-ccc';
      _fakeCnavAPI({ cnavAuthenticationService });
      userRepository.findByExternalIdentifier.resolves(null);
      authenticationSessionService.save.resolves(authenticationKey);

      // when
      const result = await authenticateCnavUser({
        code: 'code',
        redirectUri: 'redirectUri',
        stateReceived: 'state',
        stateSent: 'state',
        cnavAuthenticationService,
        authenticationSessionService,
        userRepository,
      });

      // then
      expect(result).to.deep.equal({ authenticationKey, isAuthenticationComplete: false });
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
