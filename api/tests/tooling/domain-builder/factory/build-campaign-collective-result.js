import buildCampaignLearningContent from './build-campaign-learning-content';
import CampaignCollectiveResult from '../../../../lib/domain/read-models/CampaignCollectiveResult';

export default function buildCampaignCollectiveResult({
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
}
