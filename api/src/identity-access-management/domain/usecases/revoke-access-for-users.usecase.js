import { NotFoundError } from '../../../shared/domain/errors.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

/**
 * Revokes access for a list of users.
 *
 * @param {object} params - The params object.
 * @param {string[]} params.userIds - The IDs of the users whose access should be revoked.
 */
export const revokeAccessForUsers = async function ({
  userIds,
  revokedUserAccessRepository,
  refreshTokenRepository,
  authenticationMethodRepository,
}) {
  for (const userId of userIds) {
    // Revoke user AccessToken
    await revokedUserAccessRepository.saveForUser({ userId, revokeUntil: new Date() });

    // Revoke user RefreshToken
    await refreshTokenRepository.revokeAllByUserId({ userId });

    // Revoke current user password
    try {
      const identityProvider = NON_OIDC_IDENTITY_PROVIDERS.PIX.code;
      const authenticationComplement =
        await authenticationMethodRepository.getAuthenticationComplementByUserIdAndIdentityProvider({
          userId,
          identityProvider,
        });
      authenticationComplement.revokePassword();
      await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
        authenticationComplement,
        userId,
        identityProvider,
      });
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }
  }
};
