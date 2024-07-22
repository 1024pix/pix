import { UserNotAuthorizedToUpdatePasswordError } from '../../../src/shared/domain/errors.js';
import {
  ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
  ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
} from '../constants/reset-organization-learners-password-errors.js';
import { OrganizationLearnerPasswordResetDTO } from '../models/OrganizationLearnerPasswordResetDTO.js';

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

  const organizationLearnersBelongsToOrganization = organizationLearners.every(
    (organizationLearner) => organizationLearner.organizationId === organizationId,
  );

  if (!organizationLearnersBelongsToOrganization) {
    throw new UserNotAuthorizedToUpdatePasswordError(
      errorMessage,
      ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
    );
  }

  const organizationLearnersMap = new Map();
  const studentIds = organizationLearners.map((organizationLearner) => {
    organizationLearnersMap.set(organizationLearner.userId, organizationLearner);
    return organizationLearner.userId;
  });
  const students = await userRepository.getByIds(studentIds);
  const studentsHaveAuthenticationMethodWithUsername = students.every((student) => student.username);

  if (!studentsHaveAuthenticationMethodWithUsername) {
    throw new UserNotAuthorizedToUpdatePasswordError(errorMessage, ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE);
  }

  const organizationLearnersPasswordResets = [];

  const usersToUpdateWithNewPassword = await Promise.all(
    students.map(async ({ id: userId, username, lastName, firstName }) => {
      const generatedPassword = passwordGenerator.generateSimplePassword();
      const hashedPassword = await cryptoService.hashPassword(generatedPassword);

      organizationLearnersPasswordResets.push(
        new OrganizationLearnerPasswordResetDTO({
          division: organizationLearnersMap.get(userId).division,
          lastName,
          firstName,
          username,
          password: generatedPassword,
        }),
      );

      return { userId, hashedPassword };
    }),
  );

  await authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged({
    usersToUpdateWithNewPassword,
  });

  return organizationLearnersPasswordResets;
};

export { resetOrganizationLearnersPassword };
