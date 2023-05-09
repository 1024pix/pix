const buildAssessment = require('./build-assessment.js');
const buildCampaignParticipation = require('./build-campaign-participation.js');
const buildUser = require('./build-user.js');

module.exports = (user, campaignParticipation, withAssessment) => {
  const { id: userId } = buildUser(user);
  const campaignParticipationCreated = buildCampaignParticipation({ userId, ...campaignParticipation });
  if (withAssessment) {
    buildAssessment({ userId, campaignParticipationId: campaignParticipationCreated.id });
  }
  return campaignParticipationCreated;
};
