/**
 * @param {Assessment} assessment
 * @param stageRepository
 * @param skillRepository
 * @param campaignRepository
 * @param campaignSkillRepository
 * @param stageAcquisitionRepository
 * @param knowledgeStateForParticipationService
 * @param campaignParticipationRepository
 * @param getNewAcquiredStagesService
 * @param getMasteryPercentageService
 * @param convertLevelStagesIntoThresholdsService
 *
 * @returns {Promise<void>}
 */
const handleStageAcquisition = async function ({
  assessment,
  stageRepository,
  skillRepository,
  campaignRepository,
  stageAcquisitionRepository,
  knowledgeStateForParticipationService,
  campaignParticipationRepository,
  getNewAcquiredStagesService,
  getMasteryPercentageService,
  convertLevelStagesIntoThresholdsService,
}) {
  if (!assessment.isCampaignParticipationAvailable()) return;

  const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);

  const stagesForThisCampaign = await stageRepository.getByCampaignParticipationId(campaignParticipation.id);

  if (!stagesForThisCampaign.length) return;

  if (stagesAreLevelStages(stagesForThisCampaign)) {
    const skillIds = await campaignRepository.findSkillIds({
      campaignId: campaignParticipation.campaignId,
      filterStatus: 'all',
    });
    const skills = await skillRepository.findOperativeByIds(skillIds);

    convertLevelStagesIntoThresholdsService.convertLevelStagesIntoThresholds(stagesForThisCampaign, skills);
  }

  const knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
    userId: assessment.userId,
    campaignParticipationId: assessment.campaignParticipationId,
  });
  const campaignSkillsIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
    campaignParticipationId: assessment.campaignParticipationId,
  });

  const masteryPercentage = getMasteryPercentageService.getMasteryPercentage(knowledgeState, campaignSkillsIds);

  const alreadyAcquiredStagesIds = await stageAcquisitionRepository.getStageIdsByCampaignParticipation(
    campaignParticipation.id,
  );

  const validatedSkillIdsInCampaign = knowledgeState
    .validatedSkills()
    .map(({ id }) => id)
    .filter((skillId) => campaignSkillsIds.some((id) => String(id) === String(skillId)));

  const stagesToStore = getNewAcquiredStagesService.getNewAcquiredStages(
    stagesForThisCampaign,
    validatedSkillIdsInCampaign.length,
    masteryPercentage,
    alreadyAcquiredStagesIds,
  );

  if (!stagesToStore.length) return;

  await stageAcquisitionRepository.saveStages(stagesToStore, campaignParticipation.id);
};

/**
 * If at least one stage is defined by level, we assume that
 * all stages of this campaign are defined by level.
 *
 * @param {Stage[]} stages
 *
 * @returns {boolean}
 */
const stagesAreLevelStages = (stages) => stages.some((stage) => stage.isLevelStage);

export { handleStageAcquisition };
