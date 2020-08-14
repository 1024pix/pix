const { CampaignCodeError } = require('../errors');

module.exports = async function registerAdditionalHigherEducationRegistration({
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
  if (!campaign || !campaign.organizationId) {
    throw new CampaignCodeError();
  }

  await higherEducationRegistrationRepository.saveAdditional({
    userId,
    studentNumber,
    firstName,
    lastName,
    birthdate,
  }, campaign.organizationId);
};
