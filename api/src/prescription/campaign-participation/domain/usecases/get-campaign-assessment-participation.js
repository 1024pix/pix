import { Progression } from '../../../../evaluation/domain/models/Progression.js';

const getCampaignAssessmentParticipation = async function ({
  campaignId,
  campaignParticipationId,
  campaignRepository,
  campaignAssessmentParticipationRepository,
  badgeAcquisitionRepository,
  stageRepository,
  stageAcquisitionRepository,
  compareStagesAndAcquiredStages,
  campaignParticipationRepository,
  knowledgeStateForParticipationService,
  improvementService,
}) {
  const campaignAssessmentParticipation =
    await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
      campaignId,
      campaignParticipationId,
    });

  if (campaignAssessmentParticipation.isShared) {
    const acquiredBadgesByCampaignParticipations =
      await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
        campaignParticipationsIds: [campaignParticipationId],
      });
    const badges = acquiredBadgesByCampaignParticipations[campaignAssessmentParticipation.campaignParticipationId];
    campaignAssessmentParticipation.setBadges(badges);

    const stages = await stageRepository.getByCampaignId(campaignId);

    if (stages.length) {
      const stageAcquisitions = await stageAcquisitionRepository.getByCampaignParticipation(campaignParticipationId);
      const { reachedStageNumber, totalNumberOfStages, reachedStage } = compareStagesAndAcquiredStages.compare(
        stages,
        stageAcquisitions,
      );
      campaignAssessmentParticipation.setStageInfo({
        reachedStage: reachedStageNumber,
        totalStage: totalNumberOfStages,
        prescriberTitle: reachedStage?.prescriberTitle ?? null,
        prescriberDescription: reachedStage?.prescriberDescription ?? null,
      });
    }
    campaignAssessmentParticipation.setProgression(1);
  } else {
    // this is a big duplicate from get progression. need to be factorize
    const skillIds = await campaignRepository.findSkillIds({ campaignId });
    const knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
      userId: campaignAssessmentParticipation.userId,
      campaignParticipationId,
      limitDate: null,
    });

    const isRetrying = await campaignParticipationRepository.isRetrying({
      campaignParticipationId,
    });

    const knowledgeStateForProgression = improvementService.improveKnowledgeState({
      knowledgeState,
      isRetrying,
      createdAt: campaignAssessmentParticipation.createdAt,
      isImproving: true,
      isFromCampaign: true,
    });

    const progression = new Progression({
      id: campaignParticipationId,
      skillIds,
      knowledgeState: knowledgeStateForProgression,
      isProfileCompleted: false,
    });

    campaignAssessmentParticipation.setProgression(progression.completionRate);
  }

  return campaignAssessmentParticipation;
};

export { getCampaignAssessmentParticipation };
