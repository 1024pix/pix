const buildCampaignParticipation = require('./build-campaign-participation');
const buildSchoolingRegistrationWithUser = require('./build-schooling-registration-with-user');

module.exports = (schoolingRegistration, campaignParticipation) => {
  const { userId } = buildSchoolingRegistrationWithUser(schoolingRegistration);
  return buildCampaignParticipation({ userId, ...campaignParticipation });
};

