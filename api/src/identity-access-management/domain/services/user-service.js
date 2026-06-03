import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { UserToCreate } from '../models/UserToCreate.js';

/**
 * @param user
 * @param locale
 * @param hashedPassword
 * @param userToCreateRepository
 * @param authenticationMethodRepository
 * @return {Promise<*>}
 */
export async function createUserWithPassword({
  user,
  locale,
  hashedPassword,
  userToCreateRepository,
  authenticationMethodRepository,
}) {
  const userToAdd = UserToCreate.create({ ...user, locale });
  const savedUser = await userToCreateRepository.create({ user: userToAdd });

  const authenticationMethod = _buildPasswordAuthenticationMethod({
    userId: savedUser.id,
    hashedPassword,
  });

  await authenticationMethodRepository.create({
    authenticationMethod,
  });

  return savedUser;
}

/**
 * @param userId
 * @param username
 * @param hashedPassword
 * @param authenticationMethodRepository
 * @param userRepository
 * @return {Promise<*|Promise<unknown>>}
 */
export async function updateUsernameAndAddPassword({
  userId,
  username,
  hashedPassword,
  authenticationMethodRepository,
  userRepository,
}) {
  return DomainTransaction.execute(async () => {
    await userRepository.updateUsername({ id: userId, username });
    return authenticationMethodRepository.createPasswordThatShouldBeChanged({
      userId,
      hashedPassword,
    });
  });
}

/**
 * @param hashedPassword
 * @param samlId
 * @param organizationLearnerId
 * @param user
 * @param locale
 * @param authenticationMethodRepository
 * @param organizationLearnerRepository
 * @param userToCreateRepository
 * @return {Promise<*|Promise<unknown>>}
 */
export async function createAndReconcileUserToOrganizationLearner({
  hashedPassword,
  samlId,
  organizationLearnerId,
  user,
  locale,
  authenticationMethodRepository,
  organizationLearnerRepository,
  userToCreateRepository,
}) {
  const userToAdd = UserToCreate.create({ ...user, locale });

  return DomainTransaction.execute(async () => {
    let authenticationMethod;

    const createdUser = await userToCreateRepository.create({
      user: userToAdd,
    });

    if (samlId) {
      authenticationMethod = _buildGARAuthenticationMethod({
        externalIdentifier: samlId,
        user: createdUser,
      });
    } else {
      authenticationMethod = _buildPasswordAuthenticationMethod({
        hashedPassword,
        userId: createdUser.id,
      });
    }

    await authenticationMethodRepository.create({
      authenticationMethod,
    });

    await organizationLearnerRepository.updateUserIdWhereNull({
      organizationLearnerId,
      userId: createdUser.id,
    });

    return createdUser.id;
  });
}

/**
 * @param userId
 * @param hashedPassword
 * @return {AuthenticationMethod}
 * @private
 */
function _buildPasswordAuthenticationMethod({ userId, hashedPassword }) {
  return new AuthenticationMethod({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    }),
  });
}

/**
 * @param externalIdentifier
 * @param user
 * @return {AuthenticationMethod}
 * @private
 */
function _buildGARAuthenticationMethod({ externalIdentifier, user }) {
  return new AuthenticationMethod({
    externalIdentifier,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    userId: user.id,
    authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
      firstName: user.firstName,
      lastName: user.lastName,
    }),
  });
}
