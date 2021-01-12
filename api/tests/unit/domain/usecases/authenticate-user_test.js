const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const authenticateUser = require('../../../../lib/domain/usecases/authenticate-user');
const User = require('../../../../lib/domain/models/User');
const {
  UserNotFoundError, MissingOrInvalidCredentialsError, ForbiddenAccess, UserShouldChangePasswordError,
} = require('../../../../lib/domain/errors');

const config = require('../../../../lib/config');

const authenticationService = require('../../../../lib/domain/services/authentication-service');
const appMessages = require('../../../../lib/domain/constants');

describe('Unit | Application | UseCase | authenticate-user', () => {

  let tokenService;
  let certificationCenterMembershipRepository;
  let userRepository;

  const userEmail = 'user@example.net';
  const password = 'Password1234';

  beforeEach(() => {
    tokenService = {
      createAccessTokenFromUser: sinon.stub(),
    };
    certificationCenterMembershipRepository = {
      findByUserId: sinon.stub(),
    };
    userRepository = {
      getByUsernameOrEmailWithRoles: sinon.stub(),
    };

    sinon.stub(authenticationService, 'getUserByUsernameAndPassword');
  });

  it('should resolves a valid JWT access token when authentication succeeded', async () => {
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
      certificationCenterMembershipRepository,
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

  it('should rejects an error when given username (email) does not match an existing one', async () => {
    // given
    const unknownUserEmail = 'unknown_user_email@example.net';
    authenticationService.getUserByUsernameAndPassword.rejects(new UserNotFoundError());

    // when
    const error = await catchErr(authenticateUser)({
      username: unknownUserEmail,
      password,
      tokenService,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  it('should rejects an error when given password does not match the found user’s one', async () => {
    // given
    authenticationService.getUserByUsernameAndPassword.rejects(new MissingOrInvalidCredentialsError());

    // when
    const error = await catchErr(authenticateUser)({
      username: userEmail,
      password,
      tokenService,
      certificationCenterMembershipRepository,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  context('scope access', () => {

    it('should rejects an error when scope is pix-orga and user is not linked to any organizations', async () => {
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
        certificationCenterMembershipRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('should rejects an error when scope is pix-admin and user has not pix master role', async () => {
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
        certificationCenterMembershipRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('should rejects an error when scope is pix-certif and user is not linked to any certification centers', async () => {
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
        certificationCenterMembershipRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });

    it('rejects an error when scope is pix-certif and the user is from sco and the feature toggle is activated', async () => {
      // given
      const expectedErrorMessage = appMessages.PIX_CERTIF.USER_SCO_BLOCKED_CERTIFICATION_MSG;
      sinon.stub(config.featureToggles, 'certifPrescriptionSco').value(false);

      const scope = appMessages.PIX_CERTIF.SCOPE;
      const user = domainBuilder.buildUser({ email: userEmail });
      const certificationCenterSCO = domainBuilder.buildCertificationCenter({ type: 'SCO' });
      const certificationCenterMembershipSco = domainBuilder.buildCertificationCenterMembership({ userId: user.id, certificationCenter: certificationCenterSCO });
      certificationCenterMembershipRepository.findByUserId.withArgs(user.id).resolves([ certificationCenterMembershipSco ]);
      authenticationService.getUserByUsernameAndPassword.resolves(user);

      // when
      const error = await catchErr(authenticateUser)({
        username: userEmail,
        password,
        scope,
        tokenService,
        certificationCenterMembershipRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(ForbiddenAccess);
      expect(error.message).to.be.equal(expectedErrorMessage);
    });
  });

  context('when user should change password', () => {

    it('should throw UserShouldChangePasswordError', async () => {
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
        certificationCenterMembershipRepository,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
    });
  });

});
