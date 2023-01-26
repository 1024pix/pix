const buildCampaignLearningContent = require('./build-campaign-learning-content');
const CampaignCollectiveResult = require('../../../../lib/domain/read-models/CampaignCollectiveResult');

module.exports = function buildCampaignCollectiveResult({
  id = 123,
  campaignLearningContent = buildCampaignLearningContent(),
  participantsValidatedKECountByCompetenceId = [],
  participantCount = 0,
} = {}) {
  const campaignCollectiveResult = new CampaignCollectiveResult({ id, campaignLearningContent });

  if (participantCount) {
    participantsValidatedKECountByCompetenceId.forEach((participantValidatedKECountByCompetence) => {
      campaignCollectiveResult.addValidatedSkillCountToCompetences(participantValidatedKECountByCompetence);
    });
    campaignCollectiveResult.finalize(participantCount);
  }

  return campaignCollectiveResult;
};
