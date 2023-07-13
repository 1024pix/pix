import { UserNotAuthorizedToUpdatePasswordError } from '../errors.js';
import {
  ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
  ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
  USER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
} from '../constants/update-organization-learners-password-errors.js';

const updateOrganizationLearnersPassword = async function ({
  organizationId,
  organizationLearnersId,
  userId,
  encryptionService,
  passwordGenerator,
  authenticationMethodRepository,
  organizationLearnerRepository,
  userRepository,
}) {
  const errorMessage = `User ${userId} does not have permissions to update passwords of students in organization ${organizationId}`;
  const userWithMemberships = await userRepository.getWithMemberships(userId);
  const organizationLearners = await organizationLearnerRepository.findByIds({ ids: organizationLearnersId });

  const userBelongsToOrganization = userWithMemberships.hasAccessToOrganization(organizationId);
  const organizationLearnersBelongsToOrganization = organizationLearners.every(
    (organizationLearner) => organizationLearner.organizationId === organizationId
  );

  if (!userBelongsToOrganization) {
    throw new UserNotAuthorizedToUpdatePasswordError(errorMessage, USER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE);
  }

  if (!organizationLearnersBelongsToOrganization) {
    throw new UserNotAuthorizedToUpdatePasswordError(
      errorMessage,
      ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE
    );
  }

  const studentIds = organizationLearners.map((organizationLearner) => organizationLearner.userId);
  const students = await userRepository.getByIds(studentIds);
  const studentsHaveAuthenticationMethodWithUsername = students.every((student) => student.username);

  if (!studentsHaveAuthenticationMethodWithUsername) {
    throw new UserNotAuthorizedToUpdatePasswordError(errorMessage, ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE);
  }

  const usersToUpdateWithNewPassword = await Promise.all(
    students.map(async (student) => {
      const generatedPassword = passwordGenerator.generateSimplePassword();
      const hashedPassword = await encryptionService.hashPassword(generatedPassword);
      return { userId: student.id, hashedPassword };
    })
  );

  await authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged({ usersToUpdateWithNewPassword });

  return true;
};

export { updateOrganizationLearnersPassword };
