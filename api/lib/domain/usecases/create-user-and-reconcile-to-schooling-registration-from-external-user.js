const { CampaignCodeError, ObjectValidationError } = require('../errors');
const User = require('../models/User');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');

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
  authenticationMethodRepository,
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

    await userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount(matchedSchoolingRegistration, userRepository, obfuscationService, studentRepository);

    const user = await userRepository.getBySamlId(externalUser.samlId);
    if (user) {
      return user;
    }

    userId = await userRepository.createAndReconcileUserToSchoolingRegistration({
      domainUser,
      schoolingRegistrationId: matchedSchoolingRegistration.id,
      samlId: externalUser.samlId,
    });

  } catch (error) {

    if (reconciliationErrors.includes(error.code)) {

      await authenticationMethodRepository.updateExternalIdentifierByUserIdAndIdentityProvider({
        externalIdentifier: externalUser.samlId,
        userId: error.meta.userId,
        identityProvider: AuthenticationMethod.identityProviders.GAR,
      });
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
