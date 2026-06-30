import { RecommendedModule } from '../../domain/models/combined-course-participations/value-objects/RecommendedModule.js';

export const findIdsByTargetProfileIds = async ({ targetProfileIds, recommendedModulesApi }) => {
  const recommendedModules = await recommendedModulesApi.findByTargetProfileIds({ targetProfileIds });
  return recommendedModules.map(toDomain);
};

export const findIdsByCampaignParticipationIds = async ({ campaignParticipationIds, recommendedModulesApi }) => {
  const userRecommendedModules = await recommendedModulesApi.findByCampaignParticipationIds({
    campaignParticipationIds,
  });
  return userRecommendedModules.map(toDomain);
};

const toDomain = (module) => new RecommendedModule(module);
