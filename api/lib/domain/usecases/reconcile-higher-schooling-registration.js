const { NotFoundError } = require('../errors');

module.exports = async function reconcileHigherSchoolingRegistration({
  campaignCode,
  reconciliationInfo: {
    userId,
    studentNumber,
    firstName,
    lastName,
    birthdate,
  },
  campaignRepository,
  higherSchoolingRegistrationRepository,
  schoolingRegistrationRepository,
  userReconciliationService,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new NotFoundError();
  }

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser({
    organizationId: campaign.organizationId,
    reconciliationInfo: { studentNumber, firstName, lastName, birthdate },
    higherSchoolingRegistrationRepository,
  });

  return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({ userId, schoolingRegistrationId: matchedSchoolingRegistration.id });
};
