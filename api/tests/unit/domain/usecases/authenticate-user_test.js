const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const authenticateUser = require('../../../../lib/domain/usecases/authenticate-user');
const User = require('../../../../lib/domain/models/User');
const {
  UserNotFoundError, MissingOrInvalidCredentialsError, ForbiddenAccess, UserShouldChangePasswordError
} = require('../../../../lib/domain/errors');

const authenticationService = require('../../../../lib/domain/services/authentication-service');
const appMessages = require('../../../../lib/domain/constants');

describe('Unit | Application | Use Case | authenticate-user', () => {

  let userRepository;
  let tokenService;

  const userEmail = 'user@example.net';
  const userPassword = 'user_password';

  beforeEach(() => {
    userRepository = { getByUsernameOrEmailWithRoles: sinon.stub() };
    tokenService = {
      createTokenFromUser: sinon.stub()
    };
    sinon.stub(authenticationService, 'getUserByUsernameAndPassword');
  });

  it('should resolves a valid JWT access token when authentication succeeded', async () => {
    // given
    const accessToken = 'jwt.access.token';
    const user = domainBuilder.buildUser({ email: userEmail, password: userPassword, shouldChangePassword: false });
    authenticationService.getUserByUsernameAndPassword.resolves(user);
    tokenService.createTokenFromUser.returns(accessToken);

    // when
    await authenticateUser({ username: userEmail, password: userPassword, userRepository, tokenService });

    // then
    expect(authenticationService.getUserByUsernameAndPassword).to.have.been.calledWithExactly({
      username: userEmail, password: userPassword, userRepository
    });
    expect(tokenService.createTokenFromUser).to.have.been.calledWithExactly(user, 'pix');
  });

  it('should rejects an error when given username (email) does not match an existing one', async () => {
    // given
    const unknownUserEmail = 'unknown_user_email@example.net';
    authenticationService.getUserByUsernameAndPassword.rejects(new UserNotFoundError());

    // when
    const error = await catchErr(authenticateUser)({ username: unknownUserEmail, userPassword, userRepository, tokenService });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  it('should rejects an error when given password does not match the found user’s one', async () => {
    // given
    authenticationService.getUserByUsernameAndPassword.rejects(new MissingOrInvalidCredentialsError());

    // when
    const error = await catchErr(authenticateUser)({ userEmail, userPassword, userRepository, tokenService });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  context('scope access', () => {

    it('rejects an error when scope is pix-orga and user is not linked to any organizations', async () => {
      // given
      const wrongUserPassword = 'wrong_password';
      const scope = appMessages.PIX_ORGA.SCOPE;
      const user = new User({ email: userEmail, password: userPassword, memberships: [] });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      const expectedErrorMessage = appMessages.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG;

      // when
      const error = await catchErr(authenticateUser)({ userEmail, wrongUserPassword, scope, userRepository, tokenService });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('rejects an error when scope is pix-admin and user has not pix master role', async () => {
      // given
      const scope = appMessages.PIX_ADMIN.SCOPE;
      const user = new User({ email: userEmail, password: userPassword, pixRoles: [] });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      const expectedErrorMessage = appMessages.PIX_ADMIN.NOT_PIXMASTER_MSG;

      // when
      const error = await catchErr(authenticateUser)({ userEmail, userPassword, scope, userRepository, tokenService });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('rejects an error when scope is pix-certif and user is not linked to any certification centers', async () => {
      // given
      const scope = appMessages.PIX_CERTIF.SCOPE;
      const user = domainBuilder.buildUser({ email: userEmail, password: userPassword, certificationCenterMemberships: [] });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      const expectedErrorMessage = appMessages.PIX_CERTIF.NOT_LINKED_CERTIFICATION_MSG;

      // when
      const error = await catchErr(authenticateUser)({ userEmail, userPassword, scope, userRepository, tokenService });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });
  });

  context('when user should change password', () => {

    it('should throw UserShouldChangePasswordError', async () => {
      // given
      const user = domainBuilder.buildUser({ email: userEmail, password: userPassword, shouldChangePassword: true });
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      // when
      const error = await catchErr(authenticateUser)({ username: userEmail, password: userPassword, userRepository, tokenService });

      // then
      expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
    });
  });

});
