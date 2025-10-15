import { config } from '../../../shared/config.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { CombinedCourseDetails } from '../models/CombinedCourse.js';
import { DataForQuest } from '../models/DataForQuest.js';

async function getCombinedCourseDetails({
  userId,
  combinedCourseId,
  combinedCourseParticipationRepository,
  combinedCourseRepository,
  campaignRepository,
  questRepository,
  moduleRepository,
  eligibilityRepository,
  recommendedModulesRepository,
}) {
  const combinedCourse = await combinedCourseRepository.getById({ id: combinedCourseId });
  const quest = await questRepository.findById({ questId: combinedCourse.questId });
  let participation = null;
  try {
    participation = await combinedCourseParticipationRepository.getByUserId({ questId: quest.id, userId });
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      throw err;
    }
  }

  const combinedCourseDetails = new CombinedCourseDetails(combinedCourse, quest, participation);
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

  const moduleIds = combinedCourseDetails.moduleIds;

  let recommendedModuleIdsForUser = [];
  let dataForQuest;

  if (participation) {
    const eligibility = await eligibilityRepository.findByUserIdAndOrganizationId({
      userId,
      organizationId: combinedCourse.organizationId,
      moduleIds,
    });

    dataForQuest = new DataForQuest({ eligibility });

    const campaignParticipationIds = quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

    if (campaignParticipationIds.length > 0) {
      recommendedModuleIdsForUser = await recommendedModulesRepository.findIdsByCampaignParticipationIds({
        campaignParticipationIds,
      });
    }
  }
  const modules = await moduleRepository.getByUserIdAndModuleIds({ userId, moduleIds });

  const combinedCourseUrl = '/parcours/' + combinedCourseDetails.code;
  const encryptedCombinedCourseUrl = await cryptoService.encrypt(combinedCourseUrl, config.module.secret);
  combinedCourseDetails.generateItems({
    itemDetails: [...campaigns, ...modules],
    recommendableModuleIds,
    recommendedModuleIdsForUser,
    encryptedCombinedCourseUrl,
    dataForQuest,
  });

  return combinedCourseDetails;
}

export default { getCombinedCourseDetails };
