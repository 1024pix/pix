const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const authenticateUser = require('../../../../lib/domain/usecases/authenticate-user');
const User = require('../../../../lib/domain/models/User');

const {
  UserNotFoundError,
  MissingOrInvalidCredentialsError,
  ForbiddenAccess,
  UserShouldChangePasswordError,
} = require('../../../../lib/domain/errors');

const authenticationService = require('../../../../lib/domain/services/authentication-service');
const endTestScreenRemovalService = require('../../../../lib/domain/services/end-test-screen-removal-service');
const appMessages = require('../../../../lib/domain/constants');

describe('Unit | Application | UseCase | authenticate-user', function () {
  let refreshTokenService;
  let userRepository;

  const userEmail = 'user@example.net';
  const password = 'Password1234';

  beforeEach(function () {
    refreshTokenService = {
      createRefreshTokenFromUserId: sinon.stub(),
      createAccessTokenFromRefreshToken: sinon.stub(),
    };
    userRepository = {
      getByUsernameOrEmailWithRoles: sinon.stub(),
      updateLastLoggedAt: sinon.stub(),
    };
    sinon.stub(authenticationService, 'getUserByUsernameAndPassword');
    sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledForSomeCertificationCenter');
  });

  it('should resolves a valid JWT access token when authentication succeeded', async function () {
    // given
    const accessToken = 'jwt.access.token';
    const refreshToken = 'jwt.refresh.token';
    const source = 'pix';
    const expirationDelaySeconds = 1;
    const user = domainBuilder.buildUser({ email: userEmail });

    authenticationService.getUserByUsernameAndPassword.resolves(user);
    refreshTokenService.createRefreshTokenFromUserId
      .withArgs({
        userId: user.id,
        source,
      })
      .returns(refreshToken);
    refreshTokenService.createAccessTokenFromRefreshToken
      .withArgs({ refreshToken })
      .resolves({ accessToken, expirationDelaySeconds });

    // when
    const result = await authenticateUser({
      username: userEmail,
      password,
      source,
      refreshTokenService,
      userRepository,
    });

    // then
    expect(authenticationService.getUserByUsernameAndPassword).to.have.been.calledWithExactly({
      username: userEmail,
      password,
      userRepository,
    });
    expect(result).to.deep.equal({ accessToken, refreshToken, expirationDelaySeconds });
  });

  it('should save the last date of login when authentication succeeded', async function () {
    // given
    const accessToken = 'jwt.access.token';
    const source = 'pix';
    const expirationDelaySeconds = 1;
    const user = domainBuilder.buildUser({ email: userEmail });

    authenticationService.getUserByUsernameAndPassword.resolves(user);
    refreshTokenService.createAccessTokenFromRefreshToken.resolves({ accessToken, expirationDelaySeconds });

    // when
    await authenticateUser({
      username: userEmail,
      password,
      source,
      refreshTokenService,
      userRepository,
    });

    // then
    expect(userRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
  });

  it('should rejects an error when given username (email) does not match an existing one', async function () {
    // given
    const unknownUserEmail = 'unknown_user_email@example.net';
    authenticationService.getUserByUsernameAndPassword.rejects(new UserNotFoundError());

    // when
    const error = await catchErr(authenticateUser)({
      username: unknownUserEmail,
      password,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  it('should rejects an error when given password does not match the found user’s one', async function () {
    // given
    authenticationService.getUserByUsernameAndPassword.rejects(new MissingOrInvalidCredentialsError());

    // when
    const error = await catchErr(authenticateUser)({
      username: userEmail,
      password,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  context('scope access', function () {
    it('should rejects an error when scope is pix-orga and user is not linked to any organizations', async function () {
      // given
      const scope = appMessages.PIX_ORGA.SCOPE;
      const user = new User({ email: userEmail, memberships: [] });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      const expectedErrorMessage = appMessages.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG;

      // when
      const error = await catchErr(authenticateUser)({
        username: userEmail,
        password,
        scope,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('should rejects an error when scope is pix-admin and user has not pix master role', async function () {
      // given
      const scope = appMessages.PIX_ADMIN.SCOPE;
      const user = new User({ email: userEmail, pixAdminRoles: [] });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      const expectedErrorMessage = appMessages.PIX_ADMIN.NOT_PIXMASTER_MSG;

      // when
      const error = await catchErr(authenticateUser)({
        username: userEmail,
        password,
        scope,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    context('when scope is pix-certif and user is not linked to any certification centers', function () {
      it('should rejects an error when feature toggle is disabled for all certification center', async function () {
        // given
        const scope = appMessages.PIX_CERTIF.SCOPE;
        const user = domainBuilder.buildUser({ email: userEmail, certificationCenterMemberships: [] });
        authenticationService.getUserByUsernameAndPassword.resolves(user);
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledForSomeCertificationCenter.resolves(false);

        const expectedErrorMessage = appMessages.PIX_CERTIF.NOT_LINKED_CERTIFICATION_MSG;
        // when
        const error = await catchErr(authenticateUser)({
          username: userEmail,
          password,
          scope,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.be.equal(expectedErrorMessage);
      });

      it('should resolves a valid JWT access token when feature toggle is enabled', async function () {
        // given
        const scope = appMessages.PIX_CERTIF.SCOPE;
        const accessToken = 'jwt.access.token';
        const refreshToken = 'jwt.refresh.token';
        const expirationDelaySeconds = 1;
        const source = 'pix';
        const user = domainBuilder.buildUser({
          email: userEmail,
          certificationCenterMemberships: [Symbol('certificationCenterMembership')],
        });

        endTestScreenRemovalService.isEndTestScreenRemovalEnabledForSomeCertificationCenter.resolves(true);
        authenticationService.getUserByUsernameAndPassword.resolves(user);
        refreshTokenService.createRefreshTokenFromUserId
          .withArgs({
            userId: user.id,
            source,
          })
          .returns(refreshToken);
        refreshTokenService.createAccessTokenFromRefreshToken
          .withArgs({ refreshToken })
          .resolves({ accessToken, expirationDelaySeconds });

        // when
        await authenticateUser({
          username: userEmail,
          password,
          scope,
          source,
          refreshTokenService,
          userRepository,
          endTestScreenRemovalService,
        });

        // then
        expect(authenticationService.getUserByUsernameAndPassword).to.have.been.calledWithExactly({
          username: userEmail,
          password,
          userRepository,
        });
      });
    });
  });

  context('when user should change password', function () {
    it('should throw UserShouldChangePasswordError', async function () {
      // given
      const user = domainBuilder.buildUser({ email: userEmail });
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: user.id,
        rawPassword: password,
        shouldChangePassword: true,
      });
      user.authenticationMethods = [authenticationMethod];

      authenticationService.getUserByUsernameAndPassword.resolves(user);

      // when
      const error = await catchErr(authenticateUser)({
        username: userEmail,
        password,
        userRepository,
        endTestScreenRemovalService,
      });

      // then
      expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
    });
  });
});
