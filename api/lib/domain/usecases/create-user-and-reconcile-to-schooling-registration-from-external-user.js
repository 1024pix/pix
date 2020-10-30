const { CampaignCodeError, ObjectValidationError } = require('../errors');
const User = require('../models/User');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');
const { get, isNil } = require('lodash');

module.exports = async function createUserAndReconcileToSchoolingRegistrationFromExternalUser({
  campaignCode,
  token,
  birthdate,
  campaignRepository,
  userReconciliationService,
  tokenService,
  userRepository,
  schoolingRegistrationRepository,
  studentRepository,
  obfuscationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new CampaignCodeError();
  }

  const externalUser = await tokenService.extractExternalUserFromIdToken(token);

  if (!externalUser.firstName || !externalUser.lastName || !externalUser.samlId) {
    throw new ObjectValidationError('Missing claim(s) in IdToken');
  }

  const reconciliationInfo = {
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
    birthdate,
  };

  const domainUser = new User({
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
    samlId: externalUser.samlId,
    password: '',
    cgu: false,
  });

  let matchedSchoolingRegistration;
  let userId;
  const reconciliationErrors = [
    STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_OTHER_ORGANIZATION.samlId.code,
    STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.samlId.code,
  ];

  try {

    matchedSchoolingRegistration = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
      organizationId: campaign.organizationId,
      reconciliationInfo,
      schoolingRegistrationRepository,
    });

    if (!isNil(matchedSchoolingRegistration.userId)) {
      await userReconciliationService.checkIfStudentIsAlreadyReconciledOnTheSameOrganization(matchedSchoolingRegistration.userId, userRepository, obfuscationService);
    }

    const student = await studentRepository.getReconciledStudentByNationalStudentId(matchedSchoolingRegistration.nationalStudentId);
    if (get(student, 'account')) {
      await userReconciliationService.checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student.account.userId, userRepository, obfuscationService);
    }

    const user = await userRepository.getBySamlId(externalUser.samlId);
    if (user) {
      return user;
    }

    userId = await userRepository.createAndReconcileUserToSchoolingRegistration({
      domainUser,
      schoolingRegistrationId: matchedSchoolingRegistration.id,
    });

  } catch (error) {

    if (reconciliationErrors.includes(error.code)) {

      await userRepository.updateUserAttributes(error.meta.userId, { samlId: externalUser.samlId });
      const schoolingRegistration = await schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({
        userId: error.meta.userId,
        schoolingRegistrationId: matchedSchoolingRegistration.id,
      });
      userId = schoolingRegistration.userId;

    } else {
      throw error;
    }

  }

  return userRepository.get(userId);
};
