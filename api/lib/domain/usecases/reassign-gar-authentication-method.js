const { AuthenticationMethodAlreadyExistsError, AuthenticationMethodNotFoundError } = require('../errors');
const AuthenticationMethod = require('../models/AuthenticationMethod');

module.exports = async function reassignGarAuthenticationMethod({
  originUserId,
  targetUserId,
  userRepository,
  authenticationMethodRepository,
}) {
  const garIdentityProvider = AuthenticationMethod.identityProviders.GAR;

  await userRepository.get(originUserId);
  const hasGarAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: originUserId,
    identityProvider: garIdentityProvider,
  });

  if (!hasGarAuthenticationMethod)
    throw new AuthenticationMethodNotFoundError(`L'utilisateur ${originUserId} n'a pas de méthode de connexion GAR.`);

  await userRepository.get(targetUserId);
  const hasAlreadyGarAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: targetUserId,
    identityProvider: garIdentityProvider,
  });

  if (hasAlreadyGarAuthenticationMethod)
    throw new AuthenticationMethodAlreadyExistsError(
      `L'utilisateur ${targetUserId} a déjà une méthode de connexion GAR.`
    );

  await authenticationMethodRepository.updateAuthenticationMethodUserId({
    originUserId,
    identityProvider: garIdentityProvider,
    targetUserId,
  });
};
