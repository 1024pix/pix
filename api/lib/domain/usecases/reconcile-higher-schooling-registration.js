const { NotFoundError } = require('../errors');
const HigherEducationRegistration = require('../models/HigherEducationRegistration');

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
  higherEducationRegistrationRepository,
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
    newHigherSchoolingRegistration = new HigherEducationRegistration(supernumeraryHigherSchoolingRegistrationAttributes);
    return higherEducationRegistrationRepository.saveAndReconcile(newHigherSchoolingRegistration, userId);
  }

  const foundSchoolingRegistration = await schoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({
    organizationId: campaign.organizationId,
    reconciliationInfo: { studentNumber },
  });

  if (!foundSchoolingRegistration) {
    newHigherSchoolingRegistration = new HigherEducationRegistration({
      ...supernumeraryHigherSchoolingRegistrationAttributes,
      studentNumber,
    });
    return higherEducationRegistrationRepository.saveAndReconcile(newHigherSchoolingRegistration, userId);
  }

  const matchedSchoolingRegistration = await userReconciliationService.findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser({
    organizationId: campaign.organizationId,
    reconciliationInfo: { studentNumber, firstName, lastName, birthdate },
    schoolingRegistrationRepository,
  });

  return schoolingRegistrationRepository.reconcileUserToSchoolingRegistration({ userId, schoolingRegistrationId: matchedSchoolingRegistration.id });
};
