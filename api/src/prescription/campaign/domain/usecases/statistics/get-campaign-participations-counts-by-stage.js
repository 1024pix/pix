import { NoStagesForCampaign, UserNotAuthorizedToAccessEntityError } from '../../../../../shared/domain/errors.js';
import { StageAcquisitionCollection } from '../../../../stages/domain/models/StageAcquisitionCollection.js';

export const getCampaignParticipationsCountByStage = async function ({
  userId,
  campaignId,
  stageRepository,
  campaignRepository,
  stageAcquisitionRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const stages = await stageRepository.getByCampaignId(campaignId);

  if (stages.length === 0) {
    throw new NoStagesForCampaign();
  }

  const acquiredStages = await stageAcquisitionRepository.getByCampaignId(campaignId);
  const acquiredStagesByParticipation = Object.groupBy(
    acquiredStages,
    ({ campaignParticipationId }) => campaignParticipationId,
  );

  const reachedStageIds = Object.values(acquiredStagesByParticipation).map(
    (participationAcquiredStages) =>
      new StageAcquisitionCollection(stages, participationAcquiredStages).reachedStage.id,
  );
  const participationsByReachedStageId = Object.groupBy(reachedStageIds, (stageId) => stageId);

  return stages.map((stage, index) => ({
    id: stage.id,
    value: participationsByReachedStageId[stage.id]?.length ?? 0,
    reachedStage: index + 1,
    totalStage: stages.length,
    title: stage.prescriberTitle,
    description: stage.prescriberDescription,
  }));
};
