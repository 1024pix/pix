const { NotFoundError } = require('../errors');
const HigherSchoolingRegistration = require('../models/HigherSchoolingRegistration');

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

  const supernumeraryHigherSchoolingRegistrationAttributes = {
    firstName,
    lastName,
    birthdate,
    organizationId: campaign.organizationId,
    isSupernumerary: true,
  };
  let newHigherSchoolingRegistration;

  if (!studentNumber) {
    newHigherSchoolingRegistration = new HigherSchoolingRegistration(supernumeraryHigherSchoolingRegistrationAttributes);
    return higherSchoolingRegistrationRepository.saveAndReconcile(newHigherSchoolingRegistration, userId);
  }

  const foundSchoolingRegistration = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({
    organizationId: campaign.organizationId,
    reconciliationInfo: { studentNumber },
  });

  if (!foundSchoolingRegistration) {
    newHigherSchoolingRegistration = new HigherSchoolingRegistration({
      ...supernumeraryHigherSchoolingRegistrationAttributes,
      studentNumber,
    });
    return higherSchoolingRegistrationRepository.saveAndReconcile(newHigherSchoolingRegistration, userId);
  }

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser({
    organizationId: campaign.organizationId,
    reconciliationInfo: { studentNumber, firstName, lastName, birthdate },
    higherSchoolingRegistrationRepository,
  });

  return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({ userId, schoolingRegistrationId: matchedSchoolingRegistration.id });
};
