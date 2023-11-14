import { expect, sinon, catchErr } from '../../../../test-helper.js';
import { UnexpectedOidcStateError } from '../../../../../lib/domain/errors.js';
import { logger } from '../../../../../lib/infrastructure/logger.js';
import { authenticateOidcUser } from '../../../../../lib/domain/usecases/authentication/authenticate-oidc-user.js';
import { AuthenticationSessionContent } from '../../../../../lib/domain/models/AuthenticationSessionContent.js';
import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';

describe('Unit | UseCase | authenticate-oidc-user', function () {
  let oidcAuthenticationService;
  let authenticationSessionService;
  let authenticationMethodRepository;
  let userRepository;
  let userLoginRepository;
  const externalIdentityId = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

  beforeEach(function () {
    oidcAuthenticationService = {
      identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
      createAccessToken: sinon.stub(),
      saveIdToken: sinon.stub(),
      createAuthenticationComplement: sinon.stub(),
      exchangeCodeForTokens: sinon.stub(),
      getUserInfo: sinon.stub(),
    };

    authenticationMethodRepository = {
      updateAuthenticationComplementByUserIdAndIdentityProvider: sinon.stub(),
    };

    authenticationSessionService = {
      save: sinon.stub(),
    };

    userRepository = { findByExternalIdentifier: sinon.stub() };
    userLoginRepository = {
      updateLastLoggedAt: sinon.stub().resolves(),
    };
  });

  context('When the request state does not match the response state', function () {
    it('should throw an UnexpectedOidcStateError', async function () {
      // given
      const stateSent = 'stateSent';
      const stateReceived = 'stateReceived';
      sinon.stub(logger, 'error');

      // when
      const error = await catchErr(authenticateOidcUser)({
        stateReceived,
        stateSent,
      });

      // then
      expect(error).to.be.an.instanceOf(UnexpectedOidcStateError);
      expect(logger.error).to.have.been.calledWithExactly(
        `State sent ${stateSent} did not match the state received ${stateReceived}`,
      );
    });
  });

  it('should retrieve authentication token', async function () {
    // given
    _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });

    // when
    await authenticateOidcUser({
      code: 'code',
      redirectUri: 'redirectUri',
      stateReceived: 'state',
      stateSent: 'state',
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
      userLoginRepository,
    });

    // then
    expect(oidcAuthenticationService.exchangeCodeForTokens).to.have.been.calledOnceWithExactly({
      code: 'code',
      redirectUri: 'redirectUri',
    });
  });

  it('should retrieve user info', async function () {
    // given
    const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });

    // when
    await authenticateOidcUser({
      stateReceived: 'state',
      stateSent: 'state',
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
      userLoginRepository,
    });

    // then
    expect(oidcAuthenticationService.getUserInfo).to.have.been.calledWithExactly({
      idToken: sessionContent.idToken,
      accessToken: sessionContent.accessToken,
    });
  });

  it('should retrieve user with matching external id and identity provider', async function () {
    // given
    _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });

    // when
    await authenticateOidcUser({
      stateReceived: 'state',
      stateSent: 'state',
      oidcAuthenticationService,
      authenticationSessionService,
      authenticationMethodRepository,
      userRepository,
      userLoginRepository,
    });

    // then
    expect(userRepository.findByExternalIdentifier).to.have.been.calledWithExactly({
      externalIdentityId,
      identityProvider: oidcAuthenticationService.identityProvider,
    });
  });

  context('When user does not have an account', function () {
    it('should save the authentication session and return the authentication key', async function () {
      // given
      const sessionContent = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
      const authenticationKey = 'aaa-bbb-ccc';
      const givenName = 'Mélusine';
      const familyName = 'TITEGOUTTE';
      authenticationSessionService.save.resolves(authenticationKey);
      userRepository.findByExternalIdentifier.resolves(null);

      // when
      const result = await authenticateOidcUser({
        stateReceived: 'state',
        stateSent: 'state',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(authenticationSessionService.save).to.have.been.calledWithExactly(sessionContent);
      expect(result).to.deep.equal({ authenticationKey, givenName, familyName, isAuthenticationComplete: false });
    });

    it('should not create an access token, save the id token in storage, or update the last logged date', async function () {
      // given
      _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
      userRepository.findByExternalIdentifier.resolves(null);

      // when
      await authenticateOidcUser({
        stateReceived: 'state',
        stateSent: 'state',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(oidcAuthenticationService.saveIdToken).to.not.have.been.called;
      expect(oidcAuthenticationService.createAccessToken).to.not.have.been.called;
      expect(userLoginRepository.updateLastLoggedAt).to.not.have.been.called;
    });
  });

  context('When user has an account', function () {
    context('When the provider does not have an authentication complement', function () {
      it('should not update authentication method', async function () {
        // given
        _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
        userRepository.findByExternalIdentifier.resolves({ id: 10 });
        oidcAuthenticationService.createAuthenticationComplement.returns(null);

        // when
        await authenticateOidcUser({
          stateReceived: 'state',
          stateSent: 'state',
          oidcAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider).not.to.have
          .been.called;
      });
    });

    context('When the provider has an authentication complement', function () {
      it('should update authentication method', async function () {
        // given
        const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
        userRepository.findByExternalIdentifier.resolves({ id: 1 });
        const authenticationComplement = new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
          accessToken: sessionContent.accessToken,
          refreshToken: sessionContent.refreshToken,
          expiredDate: new Date(),
        });
        oidcAuthenticationService.createAuthenticationComplement.returns(authenticationComplement);

        // when
        await authenticateOidcUser({
          stateReceived: 'state',
          stateSent: 'state',
          oidcAuthenticationService,
          authenticationSessionService,
          authenticationMethodRepository,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(
          authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider,
        ).to.have.been.calledWithExactly({
          authenticationComplement,
          userId: 1,
          identityProvider: oidcAuthenticationService.identityProvider,
        });
      });
    });

    it('should return an access token, the logout url uuid and update the last logged date with the existing external user id', async function () {
      // given
      const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
      userRepository.findByExternalIdentifier
        .withArgs({ externalIdentityId, identityProvider: oidcAuthenticationService.identityProvider })
        .resolves({ id: 10 });
      oidcAuthenticationService.createAuthenticationComplement.returns(null);
      oidcAuthenticationService.createAccessToken.withArgs(10).returns('accessTokenForExistingExternalUser');
      oidcAuthenticationService.saveIdToken
        .withArgs({ idToken: sessionContent.idToken, userId: 10 })
        .resolves('logoutUrlUUID');

      // when
      const accessToken = await authenticateOidcUser({
        stateReceived: 'state',
        stateSent: 'state',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      sinon.assert.calledOnce(oidcAuthenticationService.createAccessToken);
      sinon.assert.calledOnceWithExactly(userLoginRepository.updateLastLoggedAt, { userId: 10 });
      expect(accessToken).to.deep.equal({
        pixAccessToken: 'accessTokenForExistingExternalUser',
        logoutUrlUUID: 'logoutUrlUUID',
        isAuthenticationComplete: true,
      });
    });
  });

  context('When user is logged with their pix account but also has a separate oidc account', function () {
    it('should update the oidc authentication method', async function () {
      // given
      const { sessionContent } = _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId });
      userRepository.findByExternalIdentifier
        .withArgs({ externalIdentityId, identityProvider: oidcAuthenticationService.identityProvider })
        .resolves({ id: 10 });
      const authenticationComplement = new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
        accessToken: sessionContent.accessToken,
        refreshToken: sessionContent.refreshToken,
        expiredDate: new Date(),
      });
      oidcAuthenticationService.createAuthenticationComplement.returns(authenticationComplement);

      // when
      await authenticateOidcUser({
        stateReceived: 'state',
        stateSent: 'state',
        oidcAuthenticationService,
        authenticationSessionService,
        authenticationMethodRepository,
        userRepository,
        userLoginRepository,
      });

      // then
      expect(
        authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider,
      ).to.have.been.calledWithExactly({
        authenticationComplement,
        userId: 10,
        identityProvider: oidcAuthenticationService.identityProvider,
      });
    });
  });
});

function _fakeOidcAPI({ oidcAuthenticationService, externalIdentityId }) {
  const sessionContent = new AuthenticationSessionContent({
    accessToken: 'accessToken',
    idToken: 'idToken',
    expiresIn: 120,
    refreshToken: 'refreshToken',
  });
  const userInfo = {
    firstName: 'Mélusine',
    lastName: 'TITEGOUTTE',
    externalIdentityId,
  };

  oidcAuthenticationService.exchangeCodeForTokens.resolves(sessionContent);
  oidcAuthenticationService.getUserInfo
    .withArgs({ idToken: sessionContent.idToken, accessToken: sessionContent.accessToken })
    .resolves(userInfo);

  return { userInfo, sessionContent };
}
