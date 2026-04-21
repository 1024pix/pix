import { UserNotAuthorizedToRemoveAuthenticationMethod } from '../../../shared/domain/errors.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import * as OidcIdentityProviders from '../constants/oidc-identity-providers.js';

/**
 * @param {object} params
 * @param {string} params.userId - The ID of the user
 * @param {string} params.authenticationMethodType - The type of authentication method to remove (EMAIL, USERNAME, GAR, POLE_EMPLOI, etc.)
 * @param {UserRepository} params.userRepository
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @returns {Promise<void>}
 * @throws UserNotAuthorizedToRemoveAuthenticationMethod - If attempting to remove the last authentication method
 */
export const removeAuthenticationMethod = async function ({
  userId,
  authenticationMethodType,
  userRepository,
  authenticationMethodRepository,
}) {
  const user = await userRepository.get(userId);
  switch (authenticationMethodType) {
    case 'EMAIL':
      if (!user.username) {
        await _removeAuthenticationMethod(userId, NON_OIDC_IDENTITY_PROVIDERS.PIX.code, authenticationMethodRepository);
      }
      await userRepository.updateEmail({ id: userId, email: null });
      break;
    case 'USERNAME':
      if (!user.email) {
        await _removeAuthenticationMethod(userId, NON_OIDC_IDENTITY_PROVIDERS.PIX.code, authenticationMethodRepository);
      }
      await userRepository.updateUsername({ id: userId, username: null });
      break;
    case NON_OIDC_IDENTITY_PROVIDERS.GAR.code:
      await _removeAuthenticationMethod(userId, NON_OIDC_IDENTITY_PROVIDERS.GAR.code, authenticationMethodRepository);
      break;
    case OidcIdentityProviders.POLE_EMPLOI.code:
      await _removeAuthenticationMethod(userId, OidcIdentityProviders.POLE_EMPLOI.code, authenticationMethodRepository);
      break;
    default:
      await _removeAuthenticationMethod(userId, authenticationMethodType, authenticationMethodRepository);
  }
};

/**
 * Internal helper function to remove an authentication method by user ID and identity provider
 * @param {string} userId - The ID of the user
 * @param {string} identityProvider - The identity provider code
 * @param {AuthenticationMethodRepository} authenticationMethodRepository - Repository for authentication methods
 * @returns {Promise<void>}
 * @throws UserNotAuthorizedToRemoveAuthenticationMethod - If attempting to remove the last authentication method
 * @private
 */
async function _removeAuthenticationMethod(userId, identityProvider, authenticationMethodRepository) {
  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });

  if (authenticationMethods.length === 1) {
    throw new UserNotAuthorizedToRemoveAuthenticationMethod();
  }

  await authenticationMethodRepository.removeByUserIdAndIdentityProvider({ userId, identityProvider });
}
