import lodash from 'lodash';

import { STUDENT_RECONCILIATION_ERRORS } from '../../../../shared/constants.js';
import {
  OrganizationLearnerAlreadyLinkedToUserError,
  OrganizationLearnerNotFound,
} from '../../../../shared/domain/errors.js';

const { find, get } = lodash;

const generateUsername = async function ({
  studentInformation,
  organizationId,
  organizationLearnerRepository,
  userReconciliationService,
  obfuscationService,
  userRepository,
  studentRepository,
}) {
  const matchedOrganizationLearner = await findMatchedOrganizationLearnerForGivenOrganizationIdAndStudentInfo({
    organizationId,
    studentInformation,
    organizationLearnerRepository,
    userReconciliationService,
    obfuscationService,
  });
  await checkIfStudentIsAlreadyReconciledOnTheSameOrganization(
    matchedOrganizationLearner,
    userRepository,
    obfuscationService,
  );

  const student = await studentRepository.getReconciledStudentByNationalStudentId(
    matchedOrganizationLearner.nationalStudentId,
  );
  await checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository, obfuscationService);

  studentInformation = {
    firstName: matchedOrganizationLearner.firstName,
    lastName: matchedOrganizationLearner.lastName,
    birthdate: matchedOrganizationLearner.birthdate,
  };

  return userReconciliationService.createUsernameByUser({ user: studentInformation, userRepository });
};

export { generateUsername };

async function findMatchedOrganizationLearnerForGivenOrganizationIdAndStudentInfo({
  organizationId,
  studentInformation: { firstName, lastName, birthdate },
  organizationLearnerRepository,
  userReconciliationService,
}) {
  const organizationLearners = await organizationLearnerRepository.findByOrganizationIdAndBirthdate({
    organizationId,
    birthdate,
  });

  if (organizationLearners.length === 0) {
    throw new OrganizationLearnerNotFound(
      'There were no organizationLearners matching with organization and birthdate',
    );
  }

  const organizationLearnerId = await userReconciliationService.findMatchingCandidateIdForGivenUser(
    organizationLearners,
    { firstName, lastName },
  );

  if (!organizationLearnerId) {
    throw new OrganizationLearnerNotFound('There were no organizationLearners matching with names');
  }

  return find(organizationLearners, { id: organizationLearnerId });
}

async function checkIfStudentIsAlreadyReconciledOnTheSameOrganization(
  matchingOrganizationLearner,
  userRepository,
  obfuscationService,
) {
  if (get(matchingOrganizationLearner, 'userId')) {
    const userId = matchingOrganizationLearner.userId;
    const authenticationMethod = await obfuscationService.getObfuscatedAuthenticationMethod(userId);

    const detail = 'Un compte existe déjà pour l‘élève dans le même établissement.';
    const error =
      STUDENT_RECONCILIATION_ERRORS.LOGIN_OR_REGISTER.IN_SAME_ORGANIZATION[authenticationMethod.authenticatedBy];
    const meta = { shortCode: error.shortCode, value: authenticationMethod.value };
    throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

async function checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(
  student,
  userRepository,
  obfuscationService,
) {
  if (get(student, 'account')) {
    const userId = student.account.userId;
    const authenticationMethod = await obfuscationService.getObfuscatedAuthenticationMethod(userId);

    const detail = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
    const error =
      STUDENT_RECONCILIATION_ERRORS.LOGIN_OR_REGISTER.IN_OTHER_ORGANIZATION[authenticationMethod.authenticatedBy];
    const meta = { shortCode: error.shortCode, value: authenticationMethod.value };
    throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
  }
}
