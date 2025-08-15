import { config } from '../../../shared/config.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import { CombinedCourseDetails } from '../models/CombinedCourse.js';
import { DataForQuest } from '../models/DataForQuest.js';

export async function getCombinedCourseByCode({
  userId,
  code,
  hostURL,
  combinedCourseParticipationRepository = injectedRepositories.combinedCourseParticipationRepository,
  combinedCourseRepository = injectedRepositories.combinedCourseRepository,
  campaignRepository = injectedRepositories.campaignRepository,
  questRepository = injectedRepositories.questRepository,
  moduleRepository = injectedRepositories.moduleRepository,
  eligibilityRepository = injectedRepositories.eligibilityRepository,
  recommendedModulesRepository = injectedRepositories.recommendedModulesRepository,
} = {}) {
  const quest = await questRepository.getByCode({ code });
  const combinedCourse = await combinedCourseRepository.getByCode({ code });

  let participation = null;
  try {
    participation = await combinedCourseParticipationRepository.getByUserId({ questId: quest.id, userId });
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      throw err;
    }
  }

  const combinedCourseDetails = new CombinedCourseDetails(combinedCourse, quest, participation);

  const eligibility = await eligibilityRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId: combinedCourse.organizationId,
  });

  const dataForQuest = new DataForQuest({ eligibility });

  const campaignParticipationIds = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

  const campaignIds = combinedCourseDetails.campaignIds;
  const campaigns = [];
  const targetProfileIds = [];
  for (const campaignId of campaignIds) {
    const campaign = await campaignRepository.get({ id: campaignId });
    campaigns.push(campaign);
    targetProfileIds.push(campaign.targetProfileId);
  }

  let recommendableModuleIds = [];
  if (targetProfileIds.length > 0) {
    recommendableModuleIds = await recommendedModulesRepository.findIdsByTargetProfileIds({
      targetProfileIds,
    });
  }

  let recommendedModuleIdsForUser = [];
  if (campaignParticipationIds.length > 0) {
    recommendedModuleIdsForUser = await recommendedModulesRepository.findIdsByCampaignParticipationIds({
      campaignParticipationIds,
    });
  }

  const moduleIds = combinedCourseDetails.moduleIds;

  const modules = await moduleRepository.getByUserIdAndModuleIds({ userId, moduleIds });

  const combinedCourseUrl = hostURL + '/parcours/' + combinedCourseDetails.code;
  const encryptedCombinedCourseUrl = await cryptoService.encrypt(combinedCourseUrl, config.module.secret);
  combinedCourseDetails.generateItems(
    [...campaigns, ...modules],
    recommendableModuleIds,
    recommendedModuleIdsForUser,
    encryptedCombinedCourseUrl,
  );

  return combinedCourseDetails;
}
