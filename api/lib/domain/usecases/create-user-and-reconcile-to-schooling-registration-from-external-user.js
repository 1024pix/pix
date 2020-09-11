const { CampaignCodeError, ObjectValidationError } = require('../errors');
const User = require('../models/User');

module.exports = async function createUserAndReconcileToSchoolingRegistrationFromExternalUser({
  campaignCode,
  token,
  birthdate,
  campaignRepository,
  userReconciliationService,
  tokenService,
  userRepository,
  schoolingRegistrationRepository,
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

  const schoolingRegistration = await userReconciliationService.findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
    organizationId: campaign.organizationId,
    reconciliationInfo,
    schoolingRegistrationRepository,
    userRepository,
    obfuscationService,
  });

  const domainUser = new User({
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
    samlId: externalUser.samlId,
    password: '',
    cgu: false,
  });

  const userId = await userRepository.createAndReconcileUserToSchoolingRegistration({
    domainUser,
    schoolingRegistrationId: schoolingRegistration.id,
  });

  return userRepository.get(userId);
};
