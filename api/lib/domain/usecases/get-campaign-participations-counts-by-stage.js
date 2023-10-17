// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import * as defaultStageRepository from '../../infrastructure/repositories/stage-repository.js';
import * as defaultStageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import { UserNotAuthorizedToAccessEntityError, NoStagesForCampaign } from '../errors.js';
import * as defaultStageAndStageAcquisitionComparisonService from '../services/stages/stage-and-stage-acquisition-comparison-service.js';

const getCampaignParticipationsCountByStage = async function ({
  userId,
  campaignId,
  campaignRepository,
  stageRepository = defaultStageRepository,
  stageAndStageAcquisitionComparisonService = defaultStageAndStageAcquisitionComparisonService,
  stageAcquisitionRepository = defaultStageAcquisitionRepository,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const stages = await stageRepository.getByCampaignId(campaignId);

  if (!stages.length) {
    throw new NoStagesForCampaign();
  }

  const stageAcquisitions = await stageAcquisitionRepository.getByCampaignId(campaignId);

  const uniqueCampaignParticipationIds = [
    ...new Set(stageAcquisitions.map((stageAcquisition) => stageAcquisition.campaignParticipationId)),
  ];

  const stagesInfos = stages.map((stage, index) => ({
    id: stage.id,
    value: 0,
    reachedStage: index + 1,
    totalStage: stages.length,
    title: stage.prescriberTitle,
    description: stage.prescriberDescription,
  }));

  uniqueCampaignParticipationIds.forEach((campaignParticipationId) => {
    const stageAcquisitionForCampaignParticipation = stageAcquisitions.filter(
      (stageAcquisition) => stageAcquisition.campaignParticipationId === campaignParticipationId,
    );

    const stagesInformation = stageAndStageAcquisitionComparisonService.compare(
      stages,
      stageAcquisitionForCampaignParticipation,
    );

    const stageReached = stagesInformation.reachedStage;

    if (!stageReached) return;

    const stageIndex = stagesInfos.findIndex((data) => data.id === stageReached.id);
    stagesInfos[stageIndex].value++;
  });

  return stagesInfos;
};

export { getCampaignParticipationsCountByStage };
