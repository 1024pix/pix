const { AuthenticationMethodAlreadyExistsError, AuthenticationMethodNotFoundError } = require('../errors');
const _ = require('lodash');

module.exports = async function reassignAuthenticationMethodToAnotherUser({
  originUserId,
  targetUserId,
  authenticationMethodId,
  userRepository,
  authenticationMethodRepository,
}) {
  await userRepository.get(originUserId);
  await userRepository.get(targetUserId);

  const originUserIdAuthenticationMethods = await authenticationMethodRepository.findByUserId({ userId: originUserId });
  const authenticationMethodToReassign = originUserIdAuthenticationMethods.filter(
    (authenticationMethod) => authenticationMethod.id === authenticationMethodId
  );

  _checkIfUserHasThisAuthenticationMethod({
    userId: originUserId,
    authenticationMethodId,
    userAuthenticationMethods: authenticationMethodToReassign,
  });

  const identityProviderToReassign = authenticationMethodToReassign[0].identityProvider;

  await _checkIfTargetUserHasAlreadyAMethodWithIdentityProvider({
    targetUserId,
    identityProviderToReassign,
    authenticationMethodRepository,
  });

  await authenticationMethodRepository.updateAuthenticationMethodUserId({
    originUserId,
    identityProvider: identityProviderToReassign,
    targetUserId,
  });
};

function _checkIfUserHasThisAuthenticationMethod({ userId, authenticationMethodId, userAuthenticationMethods }) {
  if (_.isEmpty(userAuthenticationMethods))
    throw new AuthenticationMethodNotFoundError(
      `La méthode de connexion ${authenticationMethodId} n'est pas rattachée à l'utilisateur ${userId}.`
    );
}

async function _checkIfTargetUserHasAlreadyAMethodWithIdentityProvider({
  targetUserId,
  identityProviderToReassign,
  authenticationMethodRepository,
}) {
  const targetUserAuthenticationMethods = await authenticationMethodRepository.findByUserId({ userId: targetUserId });
  const hasTargetAnAuthenticationMethodWithProvider = targetUserAuthenticationMethods.find(
    (authenticationMethod) => authenticationMethod.identityProvider === identityProviderToReassign
  );

  if (hasTargetAnAuthenticationMethodWithProvider) {
    throw new AuthenticationMethodAlreadyExistsError(
      `L'utilisateur ${targetUserId} a déjà une méthode de connexion ${identityProviderToReassign}.`
    );
  }
}
