import { UserNotAuthorizedToUpdatePasswordError } from '../../../../shared/domain/errors.js';
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
  const organization = await organizationRepository.get(organizationId);

  let organizationLearnerIdentities = await organizationLearnerIdentityRepository.getByIds(
    organization.id,
    organizationLearnersId,
  );

  if (organizationLearnerIdentities.length !== organizationLearnersId.length) {
    throw new UserNotAuthorizedToUpdatePasswordError(
      `User ${userId} cannot reset passwords of some students in organization ${organizationId}`,
      ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
    );
  }

  if (!organization.hasGarIdentityProvider) {
    organizationLearnerIdentities = await _generateUsernames({
      organizationLearnerIdentities,
      userReconciliationService,
      userRepository,
    });
  }

  const usersHaveAnUsername = organizationLearnerIdentities.every((student) => student.username);
  if (!usersHaveAnUsername) {
    throw new UserNotAuthorizedToUpdatePasswordError(
      `User ${userId} cannot reset passwords of some students in organization ${organizationId}`,
      ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
    );
  }

  const userIdWithPasswords = await _generateTemporaryPasswords({
    organizationLearnerIdentities,
    authenticationMethodRepository,
    cryptoService,
    passwordGenerator,
    userLoginRepository,
  });

  return _buildOrganizationLearnerPasswordResetDTOs({
    organizationLearnerIdentities,
    userIdWithPasswords,
  });
};

async function _generateUsernames({ organizationLearnerIdentities, userReconciliationService, userRepository }) {
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

async function _generateTemporaryPasswords({
  organizationLearnerIdentities,
  authenticationMethodRepository,
  cryptoService,
  passwordGenerator,
  userLoginRepository,
}) {
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
