import { CombinedCourseDetails } from '../models/combined-course-participations/aggregates/CombinedCourseDetails.js';
import { DataForQuest } from '../models/quests/aggregates/DataForQuest.js';

async function instantiateCombinedCourseDetails({
  combinedCourseId,
  combinedCourseRepository,
  campaignRepository,
  recommendedModuleRepository,
  moduleRepository,
}) {
  const combinedCourse = await combinedCourseRepository.getById({ id: combinedCourseId });

  const combinedCourseDetails = new CombinedCourseDetails(combinedCourse, combinedCourse.quest);
  await combinedCourseDetails.setEncryptedUrl();
  const campaignIds = combinedCourseDetails.campaignIds;
  const campaigns = [];
  const targetProfileIds = [];
  for (const campaignId of campaignIds) {
    const campaign = await campaignRepository.get({ id: campaignId });
    campaigns.push(campaign);
    targetProfileIds.push(campaign.targetProfileId);
  }

  const modules = await moduleRepository.getByIds({ moduleIds: combinedCourseDetails.moduleIds });

  combinedCourseDetails.setItems({ campaigns, modules });

  let recommendableModuleIds = [];
  if (targetProfileIds.length > 0) {
    recommendableModuleIds = await recommendedModuleRepository.findIdsByTargetProfileIds({
      targetProfileIds,
    });
  }

  combinedCourseDetails.setRecommandableModuleIds(recommendableModuleIds);

  return combinedCourseDetails;
}

async function getCombinedCourseDetails({
  combinedCourseDetails,
  organizationLearnerId,
  combinedCourseParticipationRepository,
  eligibilityRepository,
  recommendedModuleRepository,
  reward,
}) {
  const participation = await combinedCourseParticipationRepository.findByLearnerId({
    organizationLearnerId,
    combinedCourseId: combinedCourseDetails.id,
  });

  let recommendedModuleIdsForUser = [];
  let dataForQuest;

  if (participation) {
    const eligibility = await eligibilityRepository.findByOrganizationAndOrganizationLearnerId({
      organizationLearnerId,
      organizationId: combinedCourseDetails.organizationId,
      moduleIds: combinedCourseDetails.moduleIds,
    });

    dataForQuest = new DataForQuest({ eligibility });

    const campaignParticipationIds =
      combinedCourseDetails.quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

    if (campaignParticipationIds.length > 0) {
      recommendedModuleIdsForUser = await recommendedModuleRepository.findIdsByCampaignParticipationIds({
        campaignParticipationIds,
      });
    }
  }

  combinedCourseDetails.setDataAndGenerateItems({
    participation,
    recommendedModuleIdsForUser,
    dataForQuest,
    reward,
  });

  return combinedCourseDetails;
}

async function getCombinedCourseDetailsForMultipleLearners({
  combinedCourseDetails,
  organizationLearners,
  combinedCourseParticipationRepository,
  eligibilityRepository,
  recommendedModuleRepository,
  profileRewardRepository,
}) {
  const organizationLearnerIds = organizationLearners.map((organizationLearner) => organizationLearner.id);
  const userIds = organizationLearners.map((organizationLearner) => organizationLearner.userId);

  const participations = await combinedCourseParticipationRepository.findByLearnerIds({
    organizationLearnerIds,
    combinedCourseId: combinedCourseDetails.id,
  });

  const participationByLearnerId = new Map(
    participations.map((participation) => [participation.organizationLearnerId, participation]),
  );
  const learnerIdsWithParticipation = organizationLearnerIds.filter((organizationLearnerId) =>
    participationByLearnerId.has(organizationLearnerId),
  );

  let eligibilitiesByLearnerId = new Map();
  let profileRewardByUserId = new Map();

  if (learnerIdsWithParticipation.length > 0) {
    eligibilitiesByLearnerId = await eligibilityRepository.findByOrganizationAndOrganizationLearnerIds({
      organizationLearnerIds: learnerIdsWithParticipation,
      organizationId: combinedCourseDetails.organizationId,
      moduleIds: combinedCourseDetails.moduleIds,
    });

    const profileRewards = await profileRewardRepository.findByUserIdsAndRewardId({
      rewardId: combinedCourseDetails.quest.rewardId,
      userIds,
    });
    profileRewardByUserId = new Map(profileRewards.map((profileReward) => [profileReward.userId, profileReward]));
  }

  const resultsByLearnerId = new Map();

  for (const organizationLearner of organizationLearners) {
    const participation = participationByLearnerId.get(organizationLearner.id);
    const eligibility = eligibilitiesByLearnerId.get(organizationLearner.id);

    let dataForQuest;
    let recommendedModuleIdsForUser = [];

    if (eligibility) {
      dataForQuest = new DataForQuest({ eligibility });
      const campaignParticipationIds =
        combinedCourseDetails.quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

      if (campaignParticipationIds.length > 0) {
        recommendedModuleIdsForUser = await recommendedModuleRepository.findIdsByCampaignParticipationIds({
          campaignParticipationIds,
        });
      }
    }

    const profileReward = profileRewardByUserId.get(organizationLearner.userId);

    combinedCourseDetails.setDataAndGenerateItems({
      participation,
      recommendedModuleIdsForUser,
      dataForQuest,
      reward: { obtainedAt: profileReward?.createdAt },
    });

    const state = {
      id: combinedCourseDetails.id,
      status: combinedCourseDetails.status,
      participation,
      items: combinedCourseDetails.items,
    };

    if (combinedCourseDetails.hasParticipation) {
      state.participationDetails = combinedCourseDetails.participationDetails;
    }

    resultsByLearnerId.set(organizationLearner.id, state);
  }

  return resultsByLearnerId;
}

export default {
  instantiateCombinedCourseDetails,
  getCombinedCourseDetails,
  getCombinedCourseDetailsForMultipleLearners,
};
