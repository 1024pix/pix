import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import authenticateUser from '../../../../lib/domain/usecases/authenticate-user';
import User from '../../../../lib/domain/models/User';
import AdminMember from '../../../../lib/domain/models/AdminMember';

import {
  UserNotFoundError,
  MissingOrInvalidCredentialsError,
  ForbiddenAccess,
  UserShouldChangePasswordError,
} from '../../../../lib/domain/errors';

import appMessages from '../../../../lib/domain/constants';

describe('Unit | Application | UseCase | authenticate-user', function () {
  let refreshTokenService;
  let userRepository;
  let adminMemberRepository;
  let pixAuthenticationService;

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
    adminMemberRepository = {
      get: sinon.stub(),
    };
    pixAuthenticationService = {
      getUserByUsernameAndPassword: sinon.stub(),
    };
  });

  context('check acces by pix scope', function () {
    context('when scope is pix-orga', function () {
      it('should rejects an error when user is not linked to any organizations', async function () {
        // given
        const scope = appMessages.PIX_ORGA.SCOPE;
        const user = new User({ email: userEmail, memberships: [] });
        pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);

        // when
        const error = await catchErr(authenticateUser)({
          username: userEmail,
          password,
          scope,
          pixAuthenticationService,
          userRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.be.equal(appMessages.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
      });
    });

    context('when scope is pix-admin', function () {
      it('should throw an error when user has no role and is therefore not an admin member', async function () {
        // given
        const scope = appMessages.PIX_ADMIN.SCOPE;
        const user = new User({ email: userEmail });
        pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
        adminMemberRepository.get.withArgs({ userId: user.id }).resolves();

        // when
        const error = await catchErr(authenticateUser)({
          username: userEmail,
          password,
          scope,
          pixAuthenticationService,
          userRepository,
          adminMemberRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.be.equal(appMessages.PIX_ADMIN.NOT_ALLOWED_MSG);
      });

      it('should throw an error when user has a role but admin membership is disabled', async function () {
        // given
        const scope = appMessages.PIX_ADMIN.SCOPE;
        const user = new User({ email: userEmail });
        const adminMember = new AdminMember({
          id: 567,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: 'CERTIF',
          createdAt: undefined,
          updatedAt: undefined,
          disabledAt: new Date(),
        });
        pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
        adminMemberRepository.get.withArgs({ userId: user.id }).resolves(adminMember);

        // when
        const error = await catchErr(authenticateUser)({
          username: userEmail,
          password,
          scope,
          pixAuthenticationService,
          userRepository,
          adminMemberRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.be.equal(appMessages.PIX_ADMIN.NOT_ALLOWED_MSG);
      });

      it('should resolve a valid JWT access token when admin member is not disabled and has a valid role', async function () {
        // given
        const scope = appMessages.PIX_ADMIN.SCOPE;
        const source = 'pix';
        const user = new User({ id: 123, email: userEmail });
        const adminMember = new AdminMember({
          id: 567,
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: 'CERTIF',
          createdAt: undefined,
          updatedAt: undefined,
          disabledAt: null,
        });

        pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
        adminMemberRepository.get.withArgs({ userId: user.id }).resolves(adminMember);

        const refreshToken = '';
        const accessToken = '';
        const expirationDelaySeconds = '';

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
          scope,
          source,
          pixAuthenticationService,
          userRepository,
          adminMemberRepository,
          refreshTokenService,
        });

        // then
        expect(pixAuthenticationService.getUserByUsernameAndPassword).to.have.been.calledWithExactly({
          username: userEmail,
          password,
          userRepository,
        });
        expect(result).to.deep.equal({ accessToken, refreshToken, expirationDelaySeconds });
      });
    });

    context('when scope is pix-certif', function () {
      context('when user is not linked to any certification centers', function () {
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

          pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
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
            pixAuthenticationService,
            refreshTokenService,
            userRepository,
          });

          // then
          expect(pixAuthenticationService.getUserByUsernameAndPassword).to.have.been.calledWithExactly({
            username: userEmail,
            password,
            userRepository,
          });
        });
      });
    });
  });

  it('should resolves a valid JWT access token when authentication succeeded', async function () {
    // given
    const accessToken = 'jwt.access.token';
    const refreshToken = 'jwt.refresh.token';
    const source = 'pix';
    const expirationDelaySeconds = 1;
    const user = domainBuilder.buildUser({ email: userEmail });

    pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
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
      pixAuthenticationService,
      refreshTokenService,
      userRepository,
    });

    // then
    expect(pixAuthenticationService.getUserByUsernameAndPassword).to.have.been.calledWithExactly({
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

    pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
    refreshTokenService.createAccessTokenFromRefreshToken.resolves({ accessToken, expirationDelaySeconds });

    // when
    await authenticateUser({
      username: userEmail,
      password,
      source,
      pixAuthenticationService,
      refreshTokenService,
      userRepository,
    });

    // then
    expect(userRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
  });

  it('should rejects an error when given username (email) does not match an existing one', async function () {
    // given
    const unknownUserEmail = 'unknown_user_email@example.net';
    pixAuthenticationService.getUserByUsernameAndPassword.rejects(new UserNotFoundError());

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
    pixAuthenticationService.getUserByUsernameAndPassword.rejects(new MissingOrInvalidCredentialsError());

    // when
    const error = await catchErr(authenticateUser)({
      username: userEmail,
      password,
      userRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(MissingOrInvalidCredentialsError);
  });

  context('when user should change password', function () {
    it('should throw UserShouldChangePasswordError', async function () {
      // given
      const tokenService = { createPasswordResetToken: sinon.stub() };

      const user = domainBuilder.buildUser({ username: 'jean.neymar2008' });
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword({
        userId: user.id,
        rawPassword: 'Password1234',
        shouldChangePassword: true,
      });
      user.authenticationMethods = [authenticationMethod];

      pixAuthenticationService.getUserByUsernameAndPassword
        .withArgs({
          username: 'jean.neymar2008',
          password: 'Password1234',
          userRepository,
        })
        .resolves(user);
      tokenService.createPasswordResetToken.withArgs(user.id).returns('RESET_PASSWORD_TOKEN');

      // when
      const error = await catchErr(authenticateUser)({
        username: 'jean.neymar2008',
        password: 'Password1234',
        userRepository,
        pixAuthenticationService,
        tokenService,
      });

      // then
      expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
      expect(error.message).to.equal('Erreur, vous devez changer votre mot de passe.');
      expect(error.meta).to.equal('RESET_PASSWORD_TOKEN');
    });
  });
});
