import { UserNotAuthorizedToAccessEntityError, NoStagesForCampaign } from '../errors';
import CampaignStages from '../read-models/campaign/CampaignStages';

export default async function getCampaignParticipationsCountByStage({
  userId,
  campaignId,
  campaignRepository,
  campaignParticipationRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const stages = await campaignRepository.findStages({ campaignId });
  const campaignStages = new CampaignStages({ stages });

  if (!campaignStages.hasReachableStages) {
    throw new NoStagesForCampaign();
  }

  const stagesBoundaries = campaignStages.stageThresholdBoundaries;
  const data = await campaignParticipationRepository.countParticipationsByStage(campaignId, stagesBoundaries);

  return stages.map((stage) => ({
    id: stage.id,
    value: data[stage.id] || 0,
    title: stage.prescriberTitle,
    description: stage.prescriberDescription,
  }));
}
