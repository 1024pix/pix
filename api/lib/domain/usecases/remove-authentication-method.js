import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { UserNotAuthorizedToRemoveAuthenticationMethod } from '../errors.js';
import * as OidcIdentityProviders from '../constants/oidc-identity-providers.js';

const removeAuthenticationMethod = async function ({ userId, type, userRepository, authenticationMethodRepository }) {
  const user = await userRepository.get(userId);

  if (type === 'EMAIL') {
    if (!user.username) {
      await _removeAuthenticationMethod(
        userId,
        AuthenticationMethod.identityProviders.PIX,
        authenticationMethodRepository
      );
    }
    await userRepository.updateEmail({ id: userId, email: null });
  }

  if (type === 'USERNAME') {
    if (!user.email) {
      await _removeAuthenticationMethod(
        userId,
        AuthenticationMethod.identityProviders.PIX,
        authenticationMethodRepository
      );
    }
    await userRepository.updateUsername({ id: userId, username: null });
  }

  if (type === 'GAR') {
    await _removeAuthenticationMethod(
      userId,
      AuthenticationMethod.identityProviders.GAR,
      authenticationMethodRepository
    );
  }

  if (type === OidcIdentityProviders.POLE_EMPLOI.code) {
    await _removeAuthenticationMethod(userId, OidcIdentityProviders.POLE_EMPLOI.code, authenticationMethodRepository);
  }

  if (type === OidcIdentityProviders.CNAV.code) {
    await _removeAuthenticationMethod(userId, OidcIdentityProviders.CNAV.code, authenticationMethodRepository);
  }
};

export { removeAuthenticationMethod };

async function _removeAuthenticationMethod(userId, identityProvider, authenticationMethodRepository) {
  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });

  if (authenticationMethods.length === 1) {
    throw new UserNotAuthorizedToRemoveAuthenticationMethod();
  }

  await authenticationMethodRepository.removeByUserIdAndIdentityProvider({ userId, identityProvider });
}
