import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { UserNotAuthorizedToRemoveAuthenticationMethod } from '../errors.js';
import * as OidcIdentityProviders from '../constants/oidc-identity-providers.js';

const removeAuthenticationMethod = async function ({ userId, type, userRepository, authenticationMethodRepository }) {
  const user = await userRepository.get(userId);

  switch (type) {
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
    case 'GAR':
      await _removeAuthenticationMethod(userId, NON_OIDC_IDENTITY_PROVIDERS.GAR.code, authenticationMethodRepository);
      break;
    case OidcIdentityProviders.POLE_EMPLOI.code:
      await _removeAuthenticationMethod(userId, OidcIdentityProviders.POLE_EMPLOI.code, authenticationMethodRepository);
      break;
    case OidcIdentityProviders.CNAV.code:
      await _removeAuthenticationMethod(userId, OidcIdentityProviders.CNAV.code, authenticationMethodRepository);
      break;
    case OidcIdentityProviders.FWB.code:
      await _removeAuthenticationMethod(userId, OidcIdentityProviders.FWB.code, authenticationMethodRepository);
      break;
    case OidcIdentityProviders.PAYSDELALOIRE.code:
      await _removeAuthenticationMethod(
        userId,
        OidcIdentityProviders.PAYSDELALOIRE.code,
        authenticationMethodRepository,
      );
      break;
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
