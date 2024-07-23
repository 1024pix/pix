// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import * as defaultConvertLevelStagesIntoThresholdsService from '../../../../src/evaluation/domain/services/stages/convert-level-stages-into-thresholds-service.js';
import * as defaultGetNewAcquiredStagesService from '../../../../src/evaluation/domain/services/stages/get-new-acquired-stages-service.js';
import * as defaultStageAcquisitionRepository from '../../../../src/evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as defaultStageRepository from '../../../../src/evaluation/infrastructure/repositories/stage-repository.js';
import * as defaultSkillRepository from '../../../../src/shared/infrastructure/repositories/skill-repository.js';
import * as defaultCampaignParticipationRepository from '../../../infrastructure/repositories/campaign-participation-repository.js';
import * as defaultCampaignRepository from '../../../infrastructure/repositories/campaign-repository.js';
import * as defaultCampaignSkillRepository from '../../../infrastructure/repositories/campaign-skill-repository.js';
import * as defaultKnowledgeElementRepositoryRepository from '../../../infrastructure/repositories/knowledge-element-repository.js';
import * as defaultGetMasteryPercentageService from '../../services/get-mastery-percentage-service.js';

/**
 * @param {Assessment} assessment
 * @param {DomainTransaction} domainTransaction
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
  stageRepository = defaultStageRepository,
  skillRepository = defaultSkillRepository,
  campaignRepository = defaultCampaignRepository,
  campaignSkillRepository = defaultCampaignSkillRepository,
  stageAcquisitionRepository = defaultStageAcquisitionRepository,
  knowledgeElementRepository = defaultKnowledgeElementRepositoryRepository,
  campaignParticipationRepository = defaultCampaignParticipationRepository,
  getNewAcquiredStagesService = defaultGetNewAcquiredStagesService,
  getMasteryPercentageService = defaultGetMasteryPercentageService,
  convertLevelStagesIntoThresholdsService = defaultConvertLevelStagesIntoThresholdsService,
}) {
  if (!assessment.isForCampaign()) return;

  const campaignParticipation = await campaignParticipationRepository.get(assessment.campaignParticipationId);

  const stagesForThisCampaign = await stageRepository.getByCampaignParticipationId(campaignParticipation.id);

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

  await stageAcquisitionRepository.saveStages(stagesToStore, assessment.userId, campaignParticipation.id);
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
