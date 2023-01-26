const get = require('lodash/get');

const {
  ForbiddenAccess,
  MissingOrInvalidCredentialsError,
  UserShouldChangePasswordError,
} = require('../../domain/errors');

const apps = require('../constants');

async function _checkUserAccessScope(scope, user, adminMemberRepository) {
  if (scope === apps.PIX_ORGA.SCOPE && !user.isLinkedToOrganizations()) {
    throw new ForbiddenAccess(apps.PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
  }

  if (scope === apps.PIX_ADMIN.SCOPE) {
    const adminMember = await adminMemberRepository.get({ userId: user.id });
    if (!adminMember?.hasAccessToAdminScope) {
      throw new ForbiddenAccess(apps.PIX_ADMIN.NOT_ALLOWED_MSG);
    }
  }
}

module.exports = async function authenticateUser({
  password,
  scope,
  source,
  username,
  refreshTokenService,
  pixAuthenticationService,
  tokenService,
  userRepository,
  adminMemberRepository,
}) {
  try {
    const foundUser = await pixAuthenticationService.getUserByUsernameAndPassword({
      username,
      password,
      userRepository,
    });

    const shouldChangePassword = get(
      foundUser,
      'authenticationMethods[0].authenticationComplement.shouldChangePassword'
    );

    if (shouldChangePassword) {
      const passwordResetToken = tokenService.createPasswordResetToken(foundUser.id);
      throw new UserShouldChangePasswordError(undefined, passwordResetToken);
    }

    await _checkUserAccessScope(scope, foundUser, adminMemberRepository);
    const refreshToken = await refreshTokenService.createRefreshTokenFromUserId({ userId: foundUser.id, source });
    const { accessToken, expirationDelaySeconds } = await refreshTokenService.createAccessTokenFromRefreshToken({
      refreshToken,
    });

    await userRepository.updateLastLoggedAt({ userId: foundUser.id });
    return { accessToken, refreshToken, expirationDelaySeconds };
  } catch (error) {
    if (error instanceof ForbiddenAccess || error instanceof UserShouldChangePasswordError) {
      throw error;
    }
    throw new MissingOrInvalidCredentialsError();
  }
};
