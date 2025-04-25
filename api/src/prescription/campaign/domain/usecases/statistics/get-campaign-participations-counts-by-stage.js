import { NoStagesForCampaign, UserNotAuthorizedToAccessEntityError } from '../../../../../shared/domain/errors.js';
import { StageAcquisitionCollection } from '../../../../../shared/domain/models/user-campaign-results/StageAcquisitionCollection.js';

/**
 * For each campaign participation, get the highest reached stage id
 *
 * @param {number[]} campaignParticipationsIds
 * @param {Stage[]} stages
 * @param {StageAcquisition[]} acquiredStages
 *
 * @returns {number[]} an array of stage ids
 */
const getHighestReachedStageIdForEachParticipation = (campaignParticipationsIds, stages, acquiredStages) =>
  campaignParticipationsIds.map((campaignParticipationId) => {
    const stageAcquisitionCollection = new StageAcquisitionCollection(
      stages,
      acquiredStages.filter((stageAcquisition) => stageAcquisition.campaignParticipationId === campaignParticipationId),
    );

    return stageAcquisitionCollection.reachedStage.id;
  });

export const getCampaignParticipationsCountByStage = async function ({
  userId,
  campaignId,
  stageRepository,
  campaignRepository,
  stageAcquisitionRepository,
  campaignParticipationsStatsRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const stages = await stageRepository.getByCampaignId(campaignId);

  if (stages.length === 0) {
    throw new NoStagesForCampaign();
  }

  const campaignParticipations =
    await campaignParticipationsStatsRepository.getAllParticipationsByCampaignId(campaignId);

  const campaignParticipationsIds = campaignParticipations.map(({ id }) => id);

  const acquiredStages = await stageAcquisitionRepository.getByCampaignParticipations(campaignParticipationsIds);

  const highestReachedStageIdForEachParticipation = getHighestReachedStageIdForEachParticipation(
    campaignParticipationsIds,
    stages,
    acquiredStages,
  );

  return stages.map((stage, index) => ({
    id: stage.id,
    value: highestReachedStageIdForEachParticipation.filter((stageId) => stageId === stage.id).length,
    reachedStage: index + 1,
    totalStage: stages.length,
    title: stage.prescriberTitle,
    description: stage.prescriberDescription,
  }));
};
