import { NoStagesForCampaign } from '../../../../../../lib/domain/errors.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';

const getCampaignParticipationsCountByStage = async function ({
  userId,
  campaignId,
  campaignRepository,
  campaignParticipationsStatsRepository,
  stageCollectionRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const stageCollection = await stageCollectionRepository.findStageCollection({ campaignId });

  if (!stageCollection.hasStage) {
    throw new NoStagesForCampaign();
  }

  const participantsResults = await campaignParticipationsStatsRepository.getAllParticipationsByCampaignId(campaignId);

  const participantsByStage = stageCollection.stages.map((stage, index) => ({
    id: stage.id,
    value: 0,
    reachedStage: index + 1,
    totalStage: stageCollection.totalStages,
    title: stage.prescriberTitle,
    description: stage.prescriberDescription,
  }));

  participantsResults.forEach((participantResult) => {
    const stageReached = stageCollection.getReachedStage(
      participantResult.validatedSkillsCount,
      participantResult.masteryRate * 100,
    );

    const stageIndex = participantsByStage.findIndex((data) => data.id === stageReached.id);
    participantsByStage[stageIndex].value++;
  });

  return participantsByStage;
};

export { getCampaignParticipationsCountByStage };
