import { AuthenticationMethodAlreadyExistsError } from '../../../shared/domain/errors.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';

/**
 * Reassigns an authentication method from one user to another.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.originUserId - The ID of the user from whom the authentication method is being reassigned.
 * @param {string} params.targetUserId - The ID of the user to whom the authentication method is being reassigned.
 * @param {string} params.authenticationMethodId - The ID of the authentication method being reassigned.
 * @throws {UserNotFoundError} if the target user does not exist.
 * @throws {AuthenticationMethodAlreadyExistsError} if the target user already has an authentication method with the given identity provider.
 */
const reassignAuthenticationMethodToAnotherUser = async function ({
  originUserId,
  targetUserId,
  authenticationMethodId,
  userRepository = injectedUserRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
} = {}) {
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
    (authenticationMethod) => authenticationMethod.identityProvider === identityProviderToReassign,
  );

  if (hasTargetAnAuthenticationMethodWithProvider) {
    throw new AuthenticationMethodAlreadyExistsError(
      `L'utilisateur ${targetUserId} a déjà une méthode de connexion ${identityProviderToReassign}.`,
    );
  }
}
