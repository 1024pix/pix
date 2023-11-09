import lodash from 'lodash';

const { get } = lodash;

import { PIX_ORGA, PIX_ADMIN } from '../../../authorization/domain/constants.js';
import { ForbiddenAccess, LocaleFormatError, LocaleNotSupportedError } from '../../../shared/domain/errors.js';
import { MissingOrInvalidCredentialsError, UserShouldChangePasswordError } from '../errors.js';

async function _checkUserAccessScope(scope, user, adminMemberRepository) {
  if (scope === PIX_ORGA.SCOPE && !user.isLinkedToOrganizations()) {
    throw new ForbiddenAccess(PIX_ORGA.NOT_LINKED_ORGANIZATION_MSG);
  }

  if (scope === PIX_ADMIN.SCOPE) {
    const adminMember = await adminMemberRepository.get({ userId: user.id });
    if (!adminMember?.hasAccessToAdminScope) {
      throw new ForbiddenAccess(PIX_ADMIN.NOT_ALLOWED_MSG);
    }
  }
}

const authenticateUser = async function ({
  password,
  scope,
  source,
  username,
  localeFromCookie,
  refreshTokenService,
  pixAuthenticationService,
  tokenService,
  userRepository,
  userLoginRepository,
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
      'authenticationMethods[0].authenticationComplement.shouldChangePassword',
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

    foundUser.setLocaleIfNotAlreadySet(localeFromCookie);
    if (foundUser.hasBeenModified) {
      await userRepository.update({ id: foundUser.id, locale: foundUser.locale });
    }

    await userLoginRepository.updateLastLoggedAt({ userId: foundUser.id });

    return { accessToken, refreshToken, expirationDelaySeconds };
  } catch (error) {
    if (
      error instanceof ForbiddenAccess ||
      error instanceof UserShouldChangePasswordError ||
      error instanceof LocaleFormatError ||
      error instanceof LocaleNotSupportedError
    ) {
      throw error;
    }
    throw new MissingOrInvalidCredentialsError();
  }
};

export { authenticateUser };
