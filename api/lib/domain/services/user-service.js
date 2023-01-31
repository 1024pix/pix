const DomainTransaction = require('../../infrastructure/DomainTransaction');

const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const UserToCreate = require('../models/UserToCreate');

function _buildPasswordAuthenticationMethod({ userId, hashedPassword }) {
  return new AuthenticationMethod({
    userId,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    }),
  });
}

function _buildGARAuthenticationMethod({ externalIdentifier, user }) {
  return new AuthenticationMethod({
    externalIdentifier,
    identityProvider: AuthenticationMethod.identityProviders.GAR,
    userId: user.id,
    authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
      firstName: user.firstName,
      lastName: user.lastName,
    }),
  });
}

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
  // On créé un utilisateur
  const userToAdd = UserToCreate.create(user);

  userToAdd.username = 'brother.little1010';

  return DomainTransaction.execute(async (domainTransaction) => {
    let authenticationMethod;

    // On recrée un nouvel utilisateur à partir des données de l'organisation learner
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

    // On lui ajoute ses méthodes d'authentification
    await authenticationMethodRepository.create({
      authenticationMethod,
      domainTransaction,
    });

    // ON met à jour l'organisation learner avec id de l'user id rattaché
    await organizationLearnerRepository.updateUserIdWhereNull({
      organizationLearnerId,
      userId: createdUser.id,
      domainTransaction,
    });

    return createdUser.id;
  });
}

module.exports = {
  createAndReconcileUserToOrganizationLearner,
  createUserWithPassword,
  updateUsernameAndAddPassword,
};
