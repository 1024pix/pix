import { UserNotAuthorizedToUpdatePasswordError } from '../../../src/shared/domain/errors.js';
import { OrganizationLearnerPasswordResetDTO } from '../../../src/shared/domain/models/OrganizationLearnerPasswordResetDTO.js';
import {
  ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
  ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
} from '../constants/reset-organization-learners-password-errors.js';

const resetOrganizationLearnersPassword = async function ({
  organizationId,
  organizationLearnersId,
  userId,
  cryptoService,
  passwordGenerator,
  authenticationMethodRepository,
  organizationLearnerRepository,
  userRepository,
}) {
  const errorMessage = `User ${userId} cannot reset passwords of some students in organization ${organizationId}`;
  const organizationLearners = await organizationLearnerRepository.findByIds({ ids: organizationLearnersId });
  const userIds = organizationLearners.map((organizationLearner) => organizationLearner.userId);
  const users = await userRepository.getByIds(userIds);

  _assertEachOrganizationLearnersBelongToOrganization({
    errorMessage,
    organizationId,
    organizationLearners,
  });
  _assertAllUsersHasAnUsername({ errorMessage, users });

  const userIdWithPasswords = await _generateNewTemporaryPasswordForUsers({ users, passwordGenerator, cryptoService });
  await authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged({
    usersToUpdateWithNewPassword: userIdWithPasswords,
  });

  return _buildOrganizationLearnerPasswordResetDTOs({ organizationLearners, users, userIdWithPasswords });
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

function _assertAllUsersHasAnUsername({ errorMessage, users }) {
  const usersHaveAnUsername = users.every((student) => student.username);

  if (!usersHaveAnUsername) {
    throw new UserNotAuthorizedToUpdatePasswordError(errorMessage, ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE);
  }
}

async function _generateNewTemporaryPasswordForUsers({ users, passwordGenerator, cryptoService }) {
  return await Promise.all(
    users.map(async ({ id: userId }) => {
      const generatedPassword = passwordGenerator.generateSimplePassword();
      const hashedPassword = await cryptoService.hashPassword(generatedPassword);

      return { userId, hashedPassword, generatedPassword };
    }),
  );
}

function _buildOrganizationLearnerPasswordResetDTOs({ organizationLearners, users, userIdWithPasswords }) {
  const userIdWithPasswordsMap = new Map(
    userIdWithPasswords.map(({ userId, generatedPassword }) => [userId, generatedPassword]),
  );

  const divisionByUserIdMap = new Map(
    organizationLearners.map((organizationLearner) => [organizationLearner.userId, organizationLearner.division]),
  );

  return users.map(
    ({ id, username, firstName, lastName }) =>
      new OrganizationLearnerPasswordResetDTO({
        division: divisionByUserIdMap.get(id),
        lastName,
        firstName,
        username,
        password: userIdWithPasswordsMap.get(id),
      }),
  );
}

export { resetOrganizationLearnersPassword };
