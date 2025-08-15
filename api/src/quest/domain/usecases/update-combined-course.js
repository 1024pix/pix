import { NotFoundError } from '../../../shared/domain/errors.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import { CombinedCourseDetails } from '../models/CombinedCourse.js';
import { DataForQuest } from '../models/DataForQuest.js';

export async function updateCombinedCourse({
  userId,
  code,
  combinedCourseRepository = injectedRepositories.combinedCourseRepository,
  combinedCourseParticipationRepository = injectedRepositories.combinedCourseParticipationRepository,
  questRepository = injectedRepositories.questRepository,
  eligibilityRepository = injectedRepositories.eligibilityRepository,
  campaignRepository = injectedRepositories.campaignRepository,
  recommendedModulesRepository = injectedRepositories.recommendedModulesRepository,
} = {}) {
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  const quest = await questRepository.getByCode({ code });

  let combinedCourseParticipation;
  try {
    combinedCourseParticipation = await combinedCourseParticipationRepository.getByUserId({
      questId: quest.id,
      userId,
    });
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      throw err;
    }
  }

  if (!combinedCourseParticipation || combinedCourseParticipation.isCompleted()) {
    return;
  }

  const combinedCourseDetails = new CombinedCourseDetails(combinedCourse, quest, combinedCourseParticipation);

  const eligibility = await eligibilityRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId: combinedCourse.organizationId,
    moduleIds: combinedCourseDetails.moduleIds,
  });

  const dataForQuest = new DataForQuest({ eligibility });

  const campaignParticipationIds = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

  const campaignIds = combinedCourseDetails.campaignIds;
  const targetProfileIds = [];
  for (const campaignId of campaignIds) {
    const campaign = await campaignRepository.get({ id: campaignId });
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

  const isCombinedCourseCompleted = combinedCourseDetails.isCompleted(
    dataForQuest,
    recommendableModuleIds,
    recommendedModuleIdsForUser,
  );

  if (isCombinedCourseCompleted) {
    combinedCourseParticipation.complete();
    return combinedCourseParticipationRepository.update({ combinedCourseParticipation });
  }

  return combinedCourseParticipation;
}
