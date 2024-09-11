import { OrganizationLearnerIdentity } from '../../../src/identity-access-management/domain/models/OrganizationLearnerIdentity.js';
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
  organizationLearnerRepository,
  userRepository,
}) {
  const errorMessage = `User ${userId} cannot reset passwords of some students in organization ${organizationId}`;
  const organization = await organizationRepository.get(organizationId);
  const organizationLearners = await organizationLearnerRepository.findByIds({ ids: organizationLearnersId });
  const userIds = organizationLearners.map((organizationLearner) => organizationLearner.userId);
  const users = await userRepository.getByIds(userIds);
  let organizationLearnerIdentities = _buildOrganizationLearnerIdentities({ organizationLearners, users });

  _assertEachOrganizationLearnersBelongToOrganization({
    errorMessage,
    organizationId,
    organizationLearners,
  });

  if (!organization.isGarIdentityProvider) {
    organizationLearnerIdentities = await _generateAndUpdateUsernameForOrganizationLearnerIdentities({
      organizationLearnerIdentities,
      userReconciliationService,
      userRepository,
    });
  }

  const userIdWithPasswords = await _generateAndUpdateUsersWithTemporaryPassword({
    errorMessage,
    organizationLearnerIdentities,
    authenticationMethodRepository,
    cryptoService,
    passwordGenerator,
  });

  return _buildOrganizationLearnerPasswordResetDTOs({ organizationLearnerIdentities, userIdWithPasswords });
};

function _assertEachOrganizationLearnersBelongToOrganization({ errorMessage, organizationId, organizationLearners }) {
  const organizationLearnersBelongsToOrganization = organizationLearners.every(
    (organizationLearner) => organizationLearner.organizationId === organizationId,
  );

  if (!organizationLearnersBelongsToOrganization) {
    throw new UserNotAuthorizedToUpdatePasswordError(
      errorMessage,
      ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
    );
  }
}

function _buildOrganizationLearnerIdentities({ organizationLearners, users }) {
  return organizationLearners.map(({ division, firstName, lastName, birthdate, userId }) => {
    const user = users.find((user) => user.id === userId);
    return new OrganizationLearnerIdentity({
      division,
      firstName,
      lastName,
      birthdate,
      userId,
      username: user.username,
    });
  });
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
