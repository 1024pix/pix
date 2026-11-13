import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { CampaignResultLevelsPerTubesAndCompetences } from '../../../campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';

const getResultLevelsPerTubesAndCompetences = async ({
  campaignParticipationId,
  locale,
  campaignParticipationRepository,
  learningContentRepository,
  knowledgeElementSnapshotRepository,
}) => {
  const participation = await campaignParticipationRepository.get(campaignParticipationId);

  if (!participation.isShared) {
    throw new UserNotAuthorizedToAccessEntityError('Campaign participation is not shared yet');
  }

  const learningContent = await learningContentRepository.findByCampaignParticipationId(
    campaignParticipationId,
    locale,
  );

  const campaignResult = new CampaignResultLevelsPerTubesAndCompetences({
    id: campaignParticipationId,
    masteryRate: participation.masteryRate,
    learningContent,
  });

  const knowledgeElementsByParticipation = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
    campaignParticipationId,
  ]);
  campaignResult.addKnowledgeElementSnapshots(knowledgeElementsByParticipation);

  return campaignResult;
};

export { getResultLevelsPerTubesAndCompetences };
