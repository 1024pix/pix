const { CampaignCodeError, SchoolingRegistrationNotFound, SchoolingRegistrationAlreadyLinkedToUserError } = require('../errors');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');
const { find ,get } = require('lodash');

module.exports = async function generateUsername({
  studentInformation,
  campaignCode,
  campaignRepository,
  schoolingRegistrationRepository,
  userReconciliationService,
  obfuscationService,
  userRepository,
  studentRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError(`Le code campagne ${campaignCode} n'existe pas.`);
  }

  const matchedSchoolingRegistration = await findMatchedSchoolingRegistrationForGivenOrganizationIdAndStudentInfo({ organizationId: campaign.organizationId, studentInformation, schoolingRegistrationRepository, userReconciliationService, obfuscationService });
  await checkIfStudentIsAlreadyReconciledOnTheSameOrganization(matchedSchoolingRegistration, userRepository, obfuscationService);

  const student = await studentRepository.getReconciledStudentByNationalStudentId(matchedSchoolingRegistration.nationalStudentId);
  await checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository, obfuscationService);

  return userReconciliationService.createUsernameByUser({ user: studentInformation , userRepository });

};

async function findMatchedSchoolingRegistrationForGivenOrganizationIdAndStudentInfo({ organizationId, studentInformation: { firstName, lastName, birthdate }, schoolingRegistrationRepository, userReconciliationService }) {
  const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationIdAndBirthdate({ organizationId, birthdate });

  if (schoolingRegistrations.length === 0) {
    throw new SchoolingRegistrationNotFound('There were no schoolingRegistrations matching with organization and birthdate');
  }

  const schoolingRegistrationId = await userReconciliationService.findMatchingCandidateIdForGivenUser(schoolingRegistrations, { firstName, lastName });

  if (!schoolingRegistrationId) {
    throw new SchoolingRegistrationNotFound('There were no schoolingRegistrations matching with names');
  }

  return find(schoolingRegistrations, { 'id': schoolingRegistrationId });

}

async function checkIfStudentIsAlreadyReconciledOnTheSameOrganization(matchingSchoolingRegistration, userRepository, obfuscationService) {
  if (get(matchingSchoolingRegistration, 'userId'))  {
    const userId = matchingSchoolingRegistration.userId ;
    const user = await userRepository.getForObfuscation(userId);
    const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

    const detail = 'Un compte existe déjà pour l‘élève dans le même établissement.';
    const error = STUDENT_RECONCILIATION_ERRORS.LOGIN_OR_REGISTER.IN_SAME_ORGANIZATION[authenticationMethod.authenticatedBy];
    const meta = { shortCode: error.shortCode, value: authenticationMethod.value };
    throw new SchoolingRegistrationAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

async function checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository, obfuscationService) {
  if (get(student, 'account')) {
    const userId = student.account.userId;
    const user = await userRepository.getForObfuscation(userId);
    const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

    const detail = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
    const error = STUDENT_RECONCILIATION_ERRORS.LOGIN_OR_REGISTER.IN_OTHER_ORGANIZATION[authenticationMethod.authenticatedBy];
    const meta = { shortCode: error.shortCode, value: authenticationMethod.value };
    throw new SchoolingRegistrationAlreadyLinkedToUserError(detail, error.code, meta);
  }
}
