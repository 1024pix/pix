const handleStageAcquisition = async function ({
  assessment,
  domainTransaction,
  stageRepository,
  skillRepository,
  campaignRepository,
  campaignSkillRepository,
  stageAcquisitionRepository,
  knowledgeElementRepository,
  campaignParticipationRepository,
  getNewAcquiredStagesService,
  getMasteryPercentageService,
  convertLevelStagesIntoThresholdsService,
}) {
  if (!assessment.isForCampaign()) return;

  const campaignParticipation = await campaignParticipationRepository.get(
    assessment.campaignParticipationId,
    domainTransaction,
  );

  const stagesForThisCampaign = await stageRepository.getByCampaignParticipationId(
    campaignParticipation.id,
    domainTransaction?.knexTransaction,
  );

  if (!stagesForThisCampaign.length) return;

  if (stagesAreLevelStages(stagesForThisCampaign)) {
    const skillIds = await campaignSkillRepository.getSkillIdsByCampaignId(campaignParticipation.campaignId);
    const skills = await skillRepository.findOperativeByIds(skillIds);

    convertLevelStagesIntoThresholdsService.convertLevelStagesIntoThresholds(stagesForThisCampaign, skills);
  }

  const [knowledgeElements, campaignSkillsIds] = await Promise.all([
    knowledgeElementRepository.findUniqByUserId({
      userId: assessment.userId,
    }),
    campaignRepository.findSkillIdsByCampaignParticipationId({
      campaignParticipationId: assessment.campaignParticipationId,
      domainTransaction,
    }),
  ]);

  const masteryPercentage = getMasteryPercentageService.getMasteryPercentage(knowledgeElements, campaignSkillsIds);

  const alreadyAcquiredStagesIds = await stageAcquisitionRepository.getStageIdsByCampaignParticipation(
    campaignParticipation.id,
    domainTransaction?.knexTransaction,
  );

  const validatedKnowledgeElements = knowledgeElements.filter(({ isValidated }) => isValidated);

  const knowledgeElementsInSkills = validatedKnowledgeElements.filter((knowledgeElement) =>
    campaignSkillsIds.some((id) => String(id) === String(knowledgeElement.skillId)),
  );

  const stagesToStore = getNewAcquiredStagesService.getNewAcquiredStages(
    stagesForThisCampaign,
    knowledgeElementsInSkills.length,
    alreadyAcquiredStagesIds,
    masteryPercentage,
  );

  if (!stagesToStore.length) return;

  await stageAcquisitionRepository.saveStages(
    stagesToStore,
    assessment.userId,
    campaignParticipation.id,
    domainTransaction?.knexTransaction,
  );
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
