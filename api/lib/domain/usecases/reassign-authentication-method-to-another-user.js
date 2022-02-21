const { AuthenticationMethodAlreadyExistsError, AuthenticationMethodNotFoundError } = require('../errors');
const _ = require('lodash');

module.exports = async function reassignAuthenticationMethodToAnotherUser({
  originUserId,
  targetUserId,
  authenticationMethodId,
  userRepository,
  authenticationMethodRepository,
}) {
  // check les users existent
  await userRepository.get(originUserId);
  await userRepository.get(targetUserId);

  const originUserIdAuthenticationMethods = await authenticationMethodRepository.findByUserId({ userId: originUserId });
  const authenticationMethodToReassign = originUserIdAuthenticationMethods.filter(
    (authenticationMethod) => authenticationMethod.id === authenticationMethodId
  );

  _checkIUserHasThisAuthenticationMethod({
    userId: originUserId,
    authenticationMethodId,
    userAuthenticationMethods: authenticationMethodToReassign,
  });

  const identityProviderToReassign = authenticationMethodToReassign[0].identityProvider;
  const targetUserAuthenticationMethods = await authenticationMethodRepository.findByUserId({ userId: targetUserId });

  _checkIfTargetUserHasAlreadyAMethodWithIdentityProvider({
    targetUserId,
    identityProviderToReassign,
    targetUserAuthenticationMethods,
  });

  await authenticationMethodRepository.updateAuthenticationMethodUserId({
    originUserId,
    identityProvider: identityProviderToReassign,
    targetUserId,
  });
};

function _checkIUserHasThisAuthenticationMethod({ userId, authenticationMethodId, userAuthenticationMethods }) {
  if (_.isEmpty(userAuthenticationMethods))
    throw new AuthenticationMethodNotFoundError(
      `La méthode de connexion ${authenticationMethodId} n'est pas rattachée à l'utilisateur ${userId}.`
    );
}

function _checkIfTargetUserHasAlreadyAMethodWithIdentityProvider({
  targetUserId,
  identityProviderToReassign,
  targetUserAuthenticationMethods,
}) {
  const hasTargetAnAuthenticationMethodWithProvider = targetUserAuthenticationMethods.find(
    (authenticationMethod) => authenticationMethod.identityProvider === identityProviderToReassign
  );

  if (hasTargetAnAuthenticationMethodWithProvider) {
    throw new AuthenticationMethodAlreadyExistsError(
      `L'utilisateur ${targetUserId} a déjà une méthode de connexion ${identityProviderToReassign}.`
    );
  }
}
