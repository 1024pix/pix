import * as injectedCampaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedCampaignParticipationRepository from '../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { repositories as injectedRepositories } from '../../../shared/infrastructure/repositories/index.js';
import * as injectedSkillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as injectedStageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as injectedStageRepository from '../../infrastructure/repositories/stage-repository.js';
import * as injectedGetMasteryPercentageService from '../services/get-mastery-percentage-service.js';
import * as injectedConvertLevelStagesIntoThresholdsService from '../services/stages/convert-level-stages-into-thresholds-service.js';
import * as injectedGetNewAcquiredStagesService from '../services/stages/get-new-acquired-stages-service.js'; /**
 * @param {Assessment} assessment
 * @param stageRepository
 * @param skillRepository
 * @param campaignRepository
 * @param campaignSkillRepository
 * @param stageAcquisitionRepository
 * @param knowledgeElementRepository
 * @param campaignParticipationRepository
 * @param getNewAcquiredStagesService
 * @param getMasteryPercentageService
 * @param convertLevelStagesIntoThresholdsService
 *
 * @returns {Promise<void>}
 */
const handleStageAcquisition = async function ({
  assessment,
  stageRepository = injectedStageRepository,
  skillRepository = injectedSkillRepository,
  campaignRepository = injectedCampaignRepository,
  stageAcquisitionRepository = injectedStageAcquisitionRepository,
  knowledgeElementRepository = injectedRepositories.knowledgeElementRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  getNewAcquiredStagesService = injectedGetNewAcquiredStagesService,
  getMasteryPercentageService = injectedGetMasteryPercentageService,
  convertLevelStagesIntoThresholdsService = injectedConvertLevelStagesIntoThresholdsService,
} = {}) {
  if (!assessment.isForCampaign()) return;

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

  const [knowledgeElements, campaignSkillsIds] = await Promise.all([
    knowledgeElementRepository.findUniqByUserIdForCampaignParticipation({
      userId: assessment.userId,
      campaignParticipationId: assessment.campaignParticipationId,
    }),
    campaignRepository.findSkillIdsByCampaignParticipationId({
      campaignParticipationId: assessment.campaignParticipationId,
    }),
  ]);

  const masteryPercentage = getMasteryPercentageService.getMasteryPercentage(knowledgeElements, campaignSkillsIds);

  const alreadyAcquiredStagesIds = await stageAcquisitionRepository.getStageIdsByCampaignParticipation(
    campaignParticipation.id,
  );

  const validatedKnowledgeElements = knowledgeElements.filter(({ isValidated }) => isValidated);

  const knowledgeElementsInSkills = validatedKnowledgeElements.filter((knowledgeElement) =>
    campaignSkillsIds.some((id) => String(id) === String(knowledgeElement.skillId)),
  );

  const stagesToStore = getNewAcquiredStagesService.getNewAcquiredStages(
    stagesForThisCampaign,
    knowledgeElementsInSkills.length,
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
