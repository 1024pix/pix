const { CampaignCodeError, ObjectValidationError } = require('../errors');
const User = require('../models/User');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');

module.exports = async function createUserAndReconcileToSchoolingRegistrationFromExternalUser({
  birthdate,
  campaignCode,
  token,
  obfuscationService,
  tokenService,
  userReconciliationService,
  userService,
  authenticationMethodRepository,
  campaignRepository,
  userRepository,
  userToCreateRepository,
  schoolingRegistrationRepository,
  studentRepository,
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
    cgu: false,
  });

  let matchedSchoolingRegistration;
  let userWithSamlId;
  let userId;
  const reconciliationErrors = [
    STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_OTHER_ORGANIZATION.samlId.code,
    STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION.samlId.code,
  ];

  try {
    matchedSchoolingRegistration =
      await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
        organizationId: campaign.organizationId,
        reconciliationInfo,
        schoolingRegistrationRepository,
      });

    await userReconciliationService.checkIfStudentHasAnAlreadyReconciledAccount(
      matchedSchoolingRegistration,
      userRepository,
      obfuscationService,
      studentRepository
    );

    userWithSamlId = await userRepository.getBySamlId(externalUser.samlId);
    if (!userWithSamlId) {
      userId = await userService.createAndReconcileUserToSchoolingRegistration({
        user: domainUser,
        schoolingRegistrationId: matchedSchoolingRegistration.id,
        samlId: externalUser.samlId,
        authenticationMethodRepository,
        schoolingRegistrationRepository,
        userToCreateRepository,
      });
    }
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
  const tokenUserId = userWithSamlId ? userWithSamlId.id : userId;
  const accessToken = tokenService.createAccessTokenForSaml(tokenUserId);
  await userRepository.updateLastLoggedAt({ userId: tokenUserId });
  return accessToken;
};
