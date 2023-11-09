import { expect, sinon, domainBuilder, catchErr } from '../../../../test-helper.js';
import { authenticateUser } from '../../../../../src/authentication/domain/usecases/authenticate-user.js';
import { User } from '../../../../../lib/domain/models/User.js';
import { AdminMember } from '../../../../../lib/domain/models/AdminMember.js';

import { UserNotFoundError } from '../../../../../lib/domain/errors.js';

import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import {
  MissingOrInvalidCredentialsError,
  UserShouldChangePasswordError,
} from '../../../../../src/authentication/domain/errors.js';
import { PIX_ADMIN, PIX_ORGA } from '../../../../../src/authorization/domain/constants.js';
import { PIX_CERTIF } from '../../../../../lib/domain/constants.js';

describe('Unit | Authentication | Domain | UseCases | authenticate-user', function () {
  let refreshTokenService;
  let userRepository;
  let userLoginRepository;
  let adminMemberRepository;
  let pixAuthenticationService;

  const userEmail = 'user@example.net';
  const password = 'Password1234';
  const localeFromCookie = 'fr';

  beforeEach(function () {
    refreshTokenService = {
      createRefreshTokenFromUserId: sinon.stub(),
      createAccessTokenFromRefreshToken: sinon.stub(),
    };
    userRepository = {
      getByUsernameOrEmailWithRoles: sinon.stub(),
      update: sinon.stub(),
    };
    userLoginRepository = {
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
        const scope = PIX_ORGA.SCOPE;
        const user = new User({ email: userEmail, memberships: [] });
        pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);

        // when
        const error = await catchErr(authenticateUser)({
          username: userEmail,
          password,
          scope,
          pixAuthenticationService,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.be.equal(PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
      });
    });

    context('when scope is pix-admin', function () {
      it('should throw an error when user has no role and is therefore not an admin member', async function () {
        // given
        const scope = PIX_ADMIN.SCOPE;
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
          userLoginRepository,
          adminMemberRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.be.equal(PIX_ADMIN.NOT_ALLOWED_MSG);
      });

      it('should throw an error when user has a role but admin membership is disabled', async function () {
        // given
        const scope = PIX_ADMIN.SCOPE;
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
          userLoginRepository,
          adminMemberRepository,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(error.message).to.be.equal(PIX_ADMIN.NOT_ALLOWED_MSG);
      });

      it('should resolve a valid JWT access token when admin member is not disabled and has a valid role', async function () {
        // given
        const scope = PIX_ADMIN.SCOPE;
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
          userLoginRepository,
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
          const scope = PIX_CERTIF.SCOPE;
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
            userLoginRepository,
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
      userLoginRepository,
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
      userLoginRepository,
    });

    // then
    expect(userLoginRepository.updateLastLoggedAt).to.have.been.calledWithExactly({ userId: user.id });
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
      userLoginRepository,
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
      userLoginRepository,
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
        userLoginRepository,
        pixAuthenticationService,
        tokenService,
      });

      // then
      expect(error).to.be.an.instanceOf(UserShouldChangePasswordError);
      expect(error.meta).to.equal('RESET_PASSWORD_TOKEN');
    });
  });

  context('check if locale is updated', function () {
    context('when user has a locale', function () {
      it('does not update the user locale', async function () {
        // given
        const accessToken = 'jwt.access.token';
        const source = 'pix';
        const expirationDelaySeconds = 1;
        const user = domainBuilder.buildUser({ email: userEmail, locale: 'fr-FR' });

        pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
        refreshTokenService.createAccessTokenFromRefreshToken.resolves({ accessToken, expirationDelaySeconds });

        // when
        await authenticateUser({
          username: userEmail,
          password,
          source,
          localeFromCookie,
          pixAuthenticationService,
          refreshTokenService,
          userRepository,
          userLoginRepository,
        });

        // then
        expect(userRepository.update).to.not.have.been.called;
      });
    });

    context('when user does not have a locale', function () {
      context('when there is a locale cookie ', function () {
        it('updates the user locale with the formatted value', async function () {
          // given
          const accessToken = 'jwt.access.token';
          const source = 'pix';
          const expirationDelaySeconds = 1;
          const user = domainBuilder.buildUser({ email: userEmail, locale: null });
          const setLocaleIfNotAlreadySetStub = sinon.stub(user, 'setLocaleIfNotAlreadySet');

          pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
          refreshTokenService.createAccessTokenFromRefreshToken.resolves({ accessToken, expirationDelaySeconds });

          // when
          await authenticateUser({
            username: userEmail,
            password,
            source,
            localeFromCookie: 'localeFromCookie',
            pixAuthenticationService,
            refreshTokenService,
            userRepository,
            userLoginRepository,
          });

          // then
          expect(setLocaleIfNotAlreadySetStub).to.have.been.calledWithExactly('localeFromCookie');
        });
      });

      context('when there is no locale cookie', function () {
        it('does not update the user locale', async function () {
          // given
          const accessToken = 'jwt.access.token';
          const source = 'pix';
          const expirationDelaySeconds = 1;
          const user = domainBuilder.buildUser({ email: userEmail, locale: undefined });

          pixAuthenticationService.getUserByUsernameAndPassword.resolves(user);
          refreshTokenService.createAccessTokenFromRefreshToken.resolves({ accessToken, expirationDelaySeconds });

          // when
          await authenticateUser({
            username: userEmail,
            password,
            source,
            localeFromCookie: undefined,
            pixAuthenticationService,
            refreshTokenService,
            userRepository,
            userLoginRepository,
          });

          // then
          expect(userRepository.update).to.not.have.been.called;
        });
      });
    });
  });
});
