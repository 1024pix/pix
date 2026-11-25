import { UserNotAuthorizedToUpdatePasswordError } from '../../../../shared/domain/errors.js';
import { OrganizationLearnerIdentities } from '../models/OrganizationLearnerIdentities.js';
import { OrganizationLearnerPasswordResetDTO } from '../models/OrganizationLearnerPasswordResetDTO.js';

const ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE =
  'ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION';
const ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE = 'ORGANIZATION_LEARNER_WITHOUT_USERNAME';

export const generateOrganizationLearnersUsernameAndTemporaryPassword = async function ({
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
  userLoginRepository,
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
    userLoginRepository,
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
  } catch {
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
  userLoginRepository,
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
  const userIds = userIdWithPasswords.map((userIdWithPasswords) => userIdWithPasswords.userId);
  await userLoginRepository.batchUnblock(userIds);

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
