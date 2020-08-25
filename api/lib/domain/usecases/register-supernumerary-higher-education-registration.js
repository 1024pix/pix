const { NotFoundError } = require('../errors');
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
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new NotFoundError();
  }

  const higherEducationRegistration = new HigherEducationRegistration({
    userId,
    studentNumber,
    firstName,
    lastName,
    birthdate,
    organizationId: campaign.organizationId,
    isSupernumerary: true,
  });

  await higherEducationRegistrationRepository.save(higherEducationRegistration);
};
