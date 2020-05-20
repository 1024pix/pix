const buildAssessment = require('./build-assessment');
const buildUser = require('./build-user');
const buildCampaignParticipation = require('./build-campaign-participation');

module.exports = function buildAssessmentFromParticipation(campaignParticipation, participant) {

  const participantId = buildUser({ ...participant }).id;
  const campaignParticipationId = buildCampaignParticipation({ ...campaignParticipation, userId: participantId }).id;

  return buildAssessment({ userId: participant.id, campaignParticipationId: campaignParticipationId });
};
