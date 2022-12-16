const { buildLearningContent } = require('./build-learning-content');
const CampaignCollectiveResult = require('../../../../lib/domain/read-models/CampaignCollectiveResult');

module.exports = function buildCampaignCollectiveResult({
  id = 123,
  learningContent = buildLearningContent(),
  participantsValidatedKECountByCompetenceId = [],
  participantCount = 0,
} = {}) {
  const campaignCollectiveResult = new CampaignCollectiveResult({ id, learningContent });

  if (participantCount) {
    participantsValidatedKECountByCompetenceId.forEach((participantValidatedKECountByCompetence) => {
      campaignCollectiveResult.addValidatedSkillCountToCompetences(participantValidatedKECountByCompetence);
    });
    campaignCollectiveResult.finalize(participantCount);
  }

  return campaignCollectiveResult;
};
