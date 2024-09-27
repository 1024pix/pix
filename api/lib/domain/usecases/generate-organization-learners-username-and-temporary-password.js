import { OrganizationLearnerIdentities } from '../../../src/identity-access-management/domain/models/OrganizationLearnerIdentities.js';
import { UserNotAuthorizedToUpdatePasswordError } from '../../../src/shared/domain/errors.js';
import { OrganizationLearnerPasswordResetDTO } from '../../../src/shared/domain/models/OrganizationLearnerPasswordResetDTO.js';
import {
  ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
  ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
} from '../constants/generate-organization-learners-username-and-temporary-password-errors.js';

const generateOrganizationLearnersUsernameAndTemporaryPassword = async function ({
  organizationId,
  organizationLearnersId,
  userId,
  cryptoService,
  passwordGenerator,
  userReconciliationService,
  authenticationMethodRepository,
  organizationRepository,
  organizationLearnerIdentityRepository,
  userRepository,
}) {
  const errorMessage = `User ${userId} cannot reset passwords of some students in organization ${organizationId}`;
  const organization = await organizationRepository.get(organizationId);
  const organizationLearnerIdentities = await _buildOrganizationLearnerIdentities({
    errorMessage,
    organization,
    organizationLearnersId,
    organizationLearnerIdentityRepository,
  });
  let organizationLearnerIdentitiesValues = organizationLearnerIdentities.values;

  if (!organizationLearnerIdentities.hasScoGarIdentityProvider) {
    organizationLearnerIdentitiesValues = await _generateAndUpdateUsernameForOrganizationLearnerIdentities({
      organizationLearnerIdentities: organizationLearnerIdentitiesValues,
      userReconciliationService,
      userRepository,
    });
  }

  const userIdWithPasswords = await _generateAndUpdateUsersWithTemporaryPassword({
    errorMessage,
    organizationLearnerIdentities: organizationLearnerIdentitiesValues,
    authenticationMethodRepository,
    cryptoService,
    passwordGenerator,
  });

  return _buildOrganizationLearnerPasswordResetDTOs({
    organizationLearnerIdentities: organizationLearnerIdentitiesValues,
    userIdWithPasswords,
  });
};

async function _buildOrganizationLearnerIdentities({
  errorMessage,
  organization,
  organizationLearnersId,
  organizationLearnerIdentityRepository,
}) {
  try {
    const organizationLearnerIdentities = await organizationLearnerIdentityRepository.getByIds(organizationLearnersId);

    return new OrganizationLearnerIdentities({
      id: organization.id,
      hasScoGarIdentityProvider: organization.hasGarIdentityProvider,
      values: organizationLearnerIdentities,
    });
  } catch (error) {
    throw new UserNotAuthorizedToUpdatePasswordError(
      errorMessage,
      ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
    );
  }
}

async function _generateAndUpdateUsernameForOrganizationLearnerIdentities({
  organizationLearnerIdentities,
  userReconciliationService,
  userRepository,
}) {
  const result = [];
  for (const organizationLearnerIdentity of organizationLearnerIdentities) {
    const temporaryOrganizationLearnerIdentity = { ...organizationLearnerIdentity };
    if (!organizationLearnerIdentity.username) {
      const username = await userReconciliationService.createUsernameByUser({
        user: organizationLearnerIdentity,
        userRepository,
      });
      temporaryOrganizationLearnerIdentity.username = username;
      await userRepository.updateUsername({ id: organizationLearnerIdentity.userId, username });
    }

    result.push(temporaryOrganizationLearnerIdentity);
  }

  return result;
}

async function _generateAndUpdateUsersWithTemporaryPassword({
  errorMessage,
  organizationLearnerIdentities,
  authenticationMethodRepository,
  cryptoService,
  passwordGenerator,
}) {
  _assertAllUsersHasAnUsername({ errorMessage, users: organizationLearnerIdentities });

  const userIdWithPasswords = await _generateNewTemporaryPasswordForOrganizationLearnerIdentities({
    organizationLearnerIdentities,
    passwordGenerator,
    cryptoService,
  });
  await authenticationMethodRepository.batchUpsertPasswordThatShouldBeChanged({
    usersToUpdateWithNewPassword: userIdWithPasswords,
  });

  return userIdWithPasswords;
}

function _assertAllUsersHasAnUsername({ errorMessage, users }) {
  const usersHaveAnUsername = users.every((student) => student.username);

  if (!usersHaveAnUsername) {
    throw new UserNotAuthorizedToUpdatePasswordError(errorMessage, ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE);
  }
}

async function _generateNewTemporaryPasswordForOrganizationLearnerIdentities({
  organizationLearnerIdentities,
  passwordGenerator,
  cryptoService,
}) {
  return await Promise.all(
    organizationLearnerIdentities.map(async ({ userId }) => {
      const generatedPassword = passwordGenerator.generateSimplePassword();
      const hashedPassword = await cryptoService.hashPassword(generatedPassword);

      return { userId, hashedPassword, generatedPassword };
    }),
  );
}

function _buildOrganizationLearnerPasswordResetDTOs({ organizationLearnerIdentities, userIdWithPasswords }) {
  const userIdWithPasswordsMap = new Map(
    userIdWithPasswords.map(({ userId, generatedPassword }) => [userId, generatedPassword]),
  );

  return organizationLearnerIdentities.map(
    ({ userId, division, firstName, lastName, username }) =>
      new OrganizationLearnerPasswordResetDTO({
        division,
        lastName,
        firstName,
        password: userIdWithPasswordsMap.get(userId),
        username,
      }),
  );
}

export { generateOrganizationLearnersUsernameAndTemporaryPassword };
