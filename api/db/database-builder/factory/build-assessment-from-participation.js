const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const buildCampaignParticipation = require('./build-campaign-participation');

module.exports = function buildAssessmentFromParticipation(campaignParticipation, participant) {
  const userId = buildUser(participant).id;
  const campaignParticipationId = buildCampaignParticipation({ ...campaignParticipation, userId }).id;

  return buildAssessment({ userId, campaignParticipationId });
};
