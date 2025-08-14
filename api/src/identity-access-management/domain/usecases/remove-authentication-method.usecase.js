import { UserNotAuthorizedToRemoveAuthenticationMethod } from '../../../shared/domain/errors.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import * as OidcIdentityProviders from '../constants/oidc-identity-providers.js';

/**
 * @param{object} params
 * @param{string} params.userId
 * @param{string} params.authenticationMethodType
 * @param{UserRepository} userRepository
 * @param{AuthenticationMethodRepository} authenticationMethodRepository
 * @returns {Promise<void>}
 * @throws UserNotAuthorizedToRemoveAuthenticationMethod
 */
export const removeAuthenticationMethod = async function ({
  userId,
  authenticationMethodType,
  userRepository = injectedUserRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
} = {}) {
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

async function _removeAuthenticationMethod(userId, identityProvider, authenticationMethodRepository) {
  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });

  if (authenticationMethods.length === 1) {
    throw new UserNotAuthorizedToRemoveAuthenticationMethod();
  }

  await authenticationMethodRepository.removeByUserIdAndIdentityProvider({ userId, identityProvider });
}
