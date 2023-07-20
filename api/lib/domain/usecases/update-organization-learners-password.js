import { UserNotAuthorizedToUpdatePasswordError } from '../errors.js';
import {
  ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
  ORGANIZATION_LEARNER_WITHOUT_USERNAME_CODE,
  USER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE,
} from '../constants/update-organization-learners-password-errors.js';
import { OrganizationLearnerPasswordDTO } from '../models/OrganizationLearnerPasswordDTO.js';

const updateOrganizationLearnersPassword = async function ({
  organizationId,
  organizationLearnersId,
  userId,
  domainTransaction,
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
    (organizationLearner) => organizationLearner.organizationId === organizationId,
  );

  if (!userBelongsToOrganization) {
    throw new UserNotAuthorizedToUpdatePasswordError(errorMessage, USER_DOES_NOT_BELONG_TO_ORGANIZATION_CODE);
  }

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

  const organizationLearnersGeneratedPassword = [];

  const usersToUpdateWithNewPassword = await Promise.all(
    students.map(async ({ id: userId, username }) => {
      const generatedPassword = passwordGenerator.generateSimplePassword();
      const hashedPassword = await encryptionService.hashPassword(generatedPassword);

      organizationLearnersGeneratedPassword.push(
        new OrganizationLearnerPasswordDTO({
          username,
          password: generatedPassword,
          division: organizationLearnersMap.get(userId).division,
        }),
      );

      return { userId, hashedPassword };
    }),
  );

  await authenticationMethodRepository.batchUpdatePasswordThatShouldBeChanged({
    usersToUpdateWithNewPassword,
    domainTransaction,
  });

  return organizationLearnersGeneratedPassword;
};

export { updateOrganizationLearnersPassword };
