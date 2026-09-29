import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { CampaignResultLevelsPerTubesAndCompetences } from '../../../campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js';

const getResultLevelsPerTubesAndCompetences = async ({
  campaignParticipationId,
  locale,
  campaignParticipationRepository,
  learningContentRepository,
  knowledgeStateSnapshotRepository,
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
    learningContent,
  });

  const knowledgeStatesByParticipation = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds([
    campaignParticipationId,
  ]);
  campaignResult.addKnowledgeStates(knowledgeStatesByParticipation);

  return campaignResult;
};

export { getResultLevelsPerTubesAndCompetences };
