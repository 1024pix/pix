import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';
import { UserToCreate } from '../../../../lib/domain/models/UserToCreate.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

async function createUserWithPassword({
  user,
  hashedPassword,
  userToCreateRepository,
  authenticationMethodRepository,
}) {
  let savedUser;
  const userToAdd = UserToCreate.create(user);

  await DomainTransaction.execute(async (domainTransaction) => {
    savedUser = await userToCreateRepository.create({ user: userToAdd, domainTransaction });

    const authenticationMethod = _buildPasswordAuthenticationMethod({
      userId: savedUser.id,
      hashedPassword,
    });

    await authenticationMethodRepository.create({
      authenticationMethod,
      domainTransaction,
    });
  });

  return savedUser;
}

async function updateUsernameAndAddPassword({
  userId,
  username,
  hashedPassword,
  authenticationMethodRepository,
  userRepository,
}) {
  return DomainTransaction.execute(async (domainTransaction) => {
    await userRepository.updateUsername({ id: userId, username, domainTransaction });
    return authenticationMethodRepository.createPasswordThatShouldBeChanged({
      userId,
      hashedPassword,
      domainTransaction,
    });
  });
}

async function createAndReconcileUserToOrganizationLearner({
  hashedPassword,
  samlId,
  organizationLearnerId,
  user,
  authenticationMethodRepository,
  organizationLearnerRepository,
  userToCreateRepository,
}) {
  const userToAdd = UserToCreate.create(user);

  return DomainTransaction.execute(async (domainTransaction) => {
    let authenticationMethod;

    const createdUser = await userToCreateRepository.create({
      user: userToAdd,
      domainTransaction,
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
      domainTransaction,
    });

    await organizationLearnerRepository.updateUserIdWhereNull({
      organizationLearnerId,
      userId: createdUser.id,
      domainTransaction,
    });

    return createdUser.id;
  });
}

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

export { createAndReconcileUserToOrganizationLearner, createUserWithPassword, updateUsernameAndAddPassword };
