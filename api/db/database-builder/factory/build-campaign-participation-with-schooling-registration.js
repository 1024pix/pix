const buildAssessment = require('./build-assessment');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildSchoolingRegistrationWithUser = require('./build-schooling-registration-with-user');

module.exports = (schoolingRegistration, campaignParticipation, withAssessment) => {
  const { userId } = buildSchoolingRegistrationWithUser(schoolingRegistration);
  const campaignParticipationCreated = buildCampaignParticipation({ userId, ...campaignParticipation });
  if (withAssessment) {
    buildAssessment({ userId, campaignParticipationId: campaignParticipationCreated.id });
  }
  return campaignParticipationCreated;
};

