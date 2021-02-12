const { buildTargetProfileWithLearningContent } = require('./build-target-profile-with-learning-content');
const CampaignCollectiveResult = require('../../../../lib/domain/read-models/CampaignCollectiveResult');

module.exports = function buildCampaignCollectiveResult({
  id = 123,
  targetProfile = buildTargetProfileWithLearningContent(),
  participantsValidatedKECountByCompetenceId = [],
  participantCount = 0,
} = {}) {
  const campaignCollectiveResult = new CampaignCollectiveResult({ id, targetProfile });

  if (participantCount) {
    participantsValidatedKECountByCompetenceId.forEach((participantValidatedKECountByCompetence) => {
      campaignCollectiveResult.addValidatedSkillCountToCompetences(participantValidatedKECountByCompetence);
    });
    campaignCollectiveResult.finalize(participantCount);
  }

  return campaignCollectiveResult;
};
