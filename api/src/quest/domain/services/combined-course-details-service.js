import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as combinedCourseParticipationRepository from '../../infrastructure/repositories/combined-course-participation-repository.js';
import * as combinedCourseRepository from '../../infrastructure/repositories/combined-course-repository.js';
import * as eligibilityRepository from '../../infrastructure/repositories/eligibility-repository.js';
import * as moduleRepository from '../../infrastructure/repositories/module-repository.js';
import * as recommendedModuleRepository from '../../infrastructure/repositories/recommended-module-repository.js';
import { CombinedCourseDetails } from '../models/CombinedCourseDetails.js';
import { DataForQuest } from '../models/DataForQuest.js';

async function instantiateCombinedCourseDetails({
  combinedCourseId,
  dependencies = { campaignRepository, moduleRepository, combinedCourseRepository, recommendedModuleRepository },
}) {
  const combinedCourse = await dependencies.combinedCourseRepository.getById({ id: combinedCourseId });

  const combinedCourseDetails = new CombinedCourseDetails(combinedCourse, combinedCourse.quest);
  await combinedCourseDetails.setEncryptedUrl();
  const campaignIds = combinedCourseDetails.campaignIds;
  const campaigns = [];
  const targetProfileIds = [];
  for (const campaignId of campaignIds) {
    const campaign = await dependencies.campaignRepository.get({ id: campaignId });
    campaigns.push(campaign);
    targetProfileIds.push(campaign.targetProfileId);
  }

  const modules = await dependencies.moduleRepository.getByIds({ moduleIds: combinedCourseDetails.moduleIds });

  combinedCourseDetails.setItems({ campaigns, modules });

  let recommendableModuleIds = [];
  if (targetProfileIds.length > 0) {
    recommendableModuleIds = await dependencies.recommendedModuleRepository.findIdsByTargetProfileIds({
      targetProfileIds,
    });
  }

  combinedCourseDetails.setRecommandableModuleIds(recommendableModuleIds);

  return combinedCourseDetails;
}

async function getCombinedCourseDetails({
  combinedCourseDetails,
  organizationLearnerId,
  reward,
  dependencies = { combinedCourseParticipationRepository, eligibilityRepository, recommendedModuleRepository },
}) {
  const participation = await dependencies.combinedCourseParticipationRepository.findByLearnerId({
    organizationLearnerId,
    combinedCourseId: combinedCourseDetails.id,
  });

  let recommendedModuleIdsForUser = [];
  let dataForQuest;

  if (participation) {
    const eligibility = await dependencies.eligibilityRepository.findByOrganizationAndOrganizationLearnerId({
      organizationLearnerId,
      organizationId: combinedCourseDetails.organizationId,
      moduleIds: combinedCourseDetails.moduleIds,
    });

    dataForQuest = new DataForQuest({ eligibility });

    const campaignParticipationIds =
      combinedCourseDetails.quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

    if (campaignParticipationIds.length > 0) {
      recommendedModuleIdsForUser = await dependencies.recommendedModuleRepository.findIdsByCampaignParticipationIds({
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
  organizationLearnerIds,
  dependencies = { combinedCourseParticipationRepository, eligibilityRepository, recommendedModuleRepository },
}) {
  const participations = await dependencies.combinedCourseParticipationRepository.findByLearnerIds({
    organizationLearnerIds,
    combinedCourseId: combinedCourseDetails.id,
  });

  const learnerIdsWithParticipation = organizationLearnerIds.filter((organizationLearnerId) =>
    participations.some((participation) => participation.organizationLearnerId === organizationLearnerId),
  );

  let eligibilitiesByLearnerId = new Map();

  if (learnerIdsWithParticipation.length > 0) {
    eligibilitiesByLearnerId = await dependencies.eligibilityRepository.findByOrganizationAndOrganizationLearnerIds({
      organizationLearnerIds: learnerIdsWithParticipation,
      organizationId: combinedCourseDetails.organizationId,
      moduleIds: combinedCourseDetails.moduleIds,
    });
  }

  const dataForQuestByLearnerId = new Map();
  const recommendedModulesByLearnerId = new Map();

  for (const learnerId of learnerIdsWithParticipation) {
    const eligibility = eligibilitiesByLearnerId.get(learnerId);
    if (!eligibility) continue;

    const dataForQuest = new DataForQuest({ eligibility });
    dataForQuestByLearnerId.set(learnerId, dataForQuest);

    const campaignParticipationIds =
      combinedCourseDetails.quest.findCampaignParticipationIdsContributingToQuest(dataForQuest);

    if (campaignParticipationIds.length > 0) {
      const recommendedModules = await dependencies.recommendedModuleRepository.findIdsByCampaignParticipationIds({
        campaignParticipationIds,
      });
      recommendedModulesByLearnerId.set(learnerId, recommendedModules);
    }
  }

  const resultsByLearnerId = new Map();

  for (const organizationLearnerId of organizationLearnerIds) {
    const participation = participations.find(
      (participation) => participation.organizationLearnerId === organizationLearnerId,
    );
    const dataForQuest = dataForQuestByLearnerId.get(organizationLearnerId);
    const recommendedModuleIdsForUser = recommendedModulesByLearnerId.get(organizationLearnerId) ?? [];

    combinedCourseDetails.setDataAndGenerateItems({
      participation,
      recommendedModuleIdsForUser,
      dataForQuest,
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

    resultsByLearnerId.set(organizationLearnerId, state);
  }

  return resultsByLearnerId;
}

export default {
  instantiateCombinedCourseDetails,
  getCombinedCourseDetails,
  getCombinedCourseDetailsForMultipleLearners,
};
