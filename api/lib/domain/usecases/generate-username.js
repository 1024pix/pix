import { CampaignCodeError, OrganizationLearnerNotFound, OrganizationLearnerAlreadyLinkedToUserError } from '../errors';

import { STUDENT_RECONCILIATION_ERRORS } from '../constants';
import { find, get } from 'lodash';

export default async function generateUsername({
  studentInformation,
  campaignCode,
  campaignRepository,
  organizationLearnerRepository,
  userReconciliationService,
  obfuscationService,
  userRepository,
  studentRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError(`Le code campagne ${campaignCode} n'existe pas.`);
  }

  const matchedOrganizationLearner = await findMatchedOrganizationLearnerForGivenOrganizationIdAndStudentInfo({
    organizationId: campaign.organizationId,
    studentInformation,
    organizationLearnerRepository,
    userReconciliationService,
    obfuscationService,
  });
  await checkIfStudentIsAlreadyReconciledOnTheSameOrganization(
    matchedOrganizationLearner,
    userRepository,
    obfuscationService
  );

  const student = await studentRepository.getReconciledStudentByNationalStudentId(
    matchedOrganizationLearner.nationalStudentId
  );
  await checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository, obfuscationService);

  studentInformation = {
    firstName: matchedOrganizationLearner.firstName,
    lastName: matchedOrganizationLearner.lastName,
    birthdate: matchedOrganizationLearner.birthdate,
  };

  return userReconciliationService.createUsernameByUser({ user: studentInformation, userRepository });
}

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
      'There were no organizationLearners matching with organization and birthdate'
    );
  }

  const organizationLearnerId = await userReconciliationService.findMatchingCandidateIdForGivenUser(
    organizationLearners,
    { firstName, lastName }
  );

  if (!organizationLearnerId) {
    throw new OrganizationLearnerNotFound('There were no organizationLearners matching with names');
  }

  return find(organizationLearners, { id: organizationLearnerId });
}

async function checkIfStudentIsAlreadyReconciledOnTheSameOrganization(
  matchingOrganizationLearner,
  userRepository,
  obfuscationService
) {
  if (get(matchingOrganizationLearner, 'userId')) {
    const userId = matchingOrganizationLearner.userId;
    const user = await userRepository.getForObfuscation(userId);
    const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

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
  obfuscationService
) {
  if (get(student, 'account')) {
    const userId = student.account.userId;
    const user = await userRepository.getForObfuscation(userId);
    const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

    const detail = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
    const error =
      STUDENT_RECONCILIATION_ERRORS.LOGIN_OR_REGISTER.IN_OTHER_ORGANIZATION[authenticationMethod.authenticatedBy];
    const meta = { shortCode: error.shortCode, value: authenticationMethod.value };
    throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
  }
}
