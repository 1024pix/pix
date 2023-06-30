import { AuthenticationMethodAlreadyExistsError } from '../../../src/shared/domain/errors.js';

const reassignAuthenticationMethodToAnotherUser = async function ({
  originUserId,
  targetUserId,
  authenticationMethodId,
  userRepository,
  authenticationMethodRepository,
}) {
  const authenticationMethodToReassign = await authenticationMethodRepository.getByIdAndUserId({
    id: authenticationMethodId,
    userId: originUserId,
  });
  const identityProviderToReassign = authenticationMethodToReassign.identityProvider;

  await _checkIfTargetUserExists({ targetUserId, userRepository });

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

export { reassignAuthenticationMethodToAnotherUser };

async function _checkIfTargetUserExists({ targetUserId, userRepository }) {
  await userRepository.get(targetUserId);
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
