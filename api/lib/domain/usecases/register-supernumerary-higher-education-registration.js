const { NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError } = require('../errors');
const HigherEducationRegistration = require('../models/HigherEducationRegistration');

module.exports = async function registerSupernumeraryHigherEducationRegistration({
  campaignCode,
  userInfo: {
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

  const doesSupernumerarySchoolingRegistrationExist = await userReconciliationService.doesSupernumerarySchoolingRegistrationExist({
    organizationId: campaign.organizationId,
    reconciliationInfo: { firstName, lastName, birthdate },
    schoolingRegistrationRepository,
  });
  if (doesSupernumerarySchoolingRegistrationExist) {
    throw new SchoolingRegistrationAlreadyLinkedToUserError();
  }

  const higherEducationRegistration = new HigherEducationRegistration({
    studentNumber,
    firstName,
    lastName,
    birthdate,
    organizationId: campaign.organizationId,
    isSupernumerary: true,
  });

  await higherEducationRegistrationRepository.saveAndReconcile(higherEducationRegistration, userId);
};
