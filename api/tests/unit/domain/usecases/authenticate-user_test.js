const {
  expect,
  sinon,
  domainBuilder,
  catchErr,
} = require('../../../test-helper');

const authenticateUser = require('../../../../lib/domain/usecases/authenticate-user');
const User = require('../../../../lib/domain/models/User');

const {
  UserNotFoundError,
  MissingOrInvalidCredentialsError,
  ForbiddenAccess,
  UserShouldChangePasswordError,
} = require('../../../../lib/domain/errors');

const authenticationService = require('../../../../lib/domain/services/authentication-service');
const appMessages = require('../../../../lib/domain/constants');

describe('Unit | Application | UseCase | authenticate-user', function() {

  let tokenService;
  let userRepository;

  const userEmail = 'user@example.net';
  const password = 'Password1234';

  beforeEach(function() {
    tokenService = {
      createAccessTokenFromUser: sinon.stub(),
    };
    userRepository = {
      getByUsernameOrEmailWithRoles: sinon.stub(),
      updateLastLoggedAt: sinon.stub(),
    };
    sinon.stub(authenticationService, 'getUserByUsernameAndPassword');
  });

  it('should resolves a valid JWT access token when authentication succeeded', async function() {
    // given
    const accessToken = 'jwt.access.token';
    const source = 'pix';
    const user = domainBuilder.buildUser({ email: userEmail });

    authenticationService.getUserByUsernameAndPassword.resolves(user);
    tokenService.createAccessTokenFromUser.returns(accessToken);

    // when
    await authenticateUser({
      username: userEmail,
      password,
      source,
      tokenService,
      userRepository,
    });

    // then
    expect(authenticationService.getUserByUsernameAndPassword).to.have.been.calledWithExactly({
      username: userEmail,
      password,
      userRepository,
    });
    expect(tokenService.createAccessTokenFromUser)
      .to.have.been.calledWithExactly(user.id, source);
  });

  it('should save the last date of login when authentication succeeded', async function() {
    // given
    const accessToken = 'jwt.access.token';
    const source = 'pix';
    const user = domainBuilder.buildUser({ email: userEmail });

    authenticationService.getUserByUsernameAndPassword.resolves(user);
    tokenService.createAccessTokenFromUser.returns(accessToken);

    // when
    await authenticateUser({
      username: userEmail,
      password,
      source,
      tokenService,
      userRepository,
    });

    // then
    expect(userRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
  });

  it('should rejects an error when given username (email) does not match an existing one', async function() {
    // given
    const unknownUserEmail = 'unknown_user_email@example.net';
    authenticationService.getUserByUsernameAndPassword.rejects(new UserNotFoundError());

    // when
    const error = await catchErr(authenticateUser)({
      username: unknownUserEmail,
      password,
      tokenService,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  it('should rejects an error when given password does not match the found user’s one', async function() {
    // given
    authenticationService.getUserByUsernameAndPassword.rejects(new MissingOrInvalidCredentialsError());

    // when
    const error = await catchErr(authenticateUser)({
      username: userEmail,
      password,
      tokenService,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  context('scope access', function() {

    it('should rejects an error when scope is pix-orga and user is not linked to any organizations', async function() {
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
        tokenService,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('should rejects an error when scope is pix-admin and user has not pix master role', async function() {
      // given
      const scope = appMessages.PIX_ADMIN.SCOPE;
      const user = new User({ email: userEmail, pixRoles: [] });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      const expectedErrorMessage = appMessages.PIX_ADMIN.NOT_PIXMASTER_MSG;

      // when
      const error = await catchErr(authenticateUser)({
        username: userEmail,
        password,
        scope,
        tokenService,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('should rejects an error when scope is pix-certif and user is not linked to any certification centers', async function() {
      // given
      const scope = appMessages.PIX_CERTIF.SCOPE;
      const user = domainBuilder.buildUser({ email: userEmail, certificationCenterMemberships: [] });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      const expectedErrorMessage = appMessages.PIX_CERTIF.NOT_LINKED_CERTIFICATION_MSG;

      // when
      const error = await catchErr(authenticateUser)({
        username: userEmail,
        password,
        scope,
        tokenService,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });
  });

  context('when user should change password', function() {

    it('should throw UserShouldChangePasswordError', async function() {
      // given
      const user = domainBuilder.buildUser({ email: userEmail });
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithRawPassword({
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
        tokenService,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
    });
  });

});
