import { AuthenticationMethodNotFoundError } from '../../../shared/domain/errors.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { refreshTokenRepository as injectedRefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository.js';
import { revokedUserAccessRepository as injectedRevokedUserAccessRepository } from '../../infrastructure/repositories/revoked-user-access.repository.js';

/**
 * Revokes access for a list of users.
 *
 * @param {object} params - The params object.
 * @param {string[]} params.userIds - The IDs of the users whose access should be revoked.
 */
export const revokeAccessForUsers = async function ({
  userIds,
  revokedUserAccessRepository = injectedRevokedUserAccessRepository,
  refreshTokenRepository = injectedRefreshTokenRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
} = {}) {
  for (const userId of userIds) {
    // Revoke user access for access token
    await revokedUserAccessRepository.saveForUser({ userId, revokeUntil: new Date() });

    // Revoke user access for refresh token
    await refreshTokenRepository.revokeAllByUserId({ userId });

    // Revoke current user password
    try {
      await authenticationMethodRepository.updatePassword({ userId, hashedPassword: '[revoked]' });
    } catch (error) {
      if (!(error instanceof AuthenticationMethodNotFoundError)) throw error;
    }
  }
};
