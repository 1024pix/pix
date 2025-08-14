import { RecommendedModule } from '../../domain/models/RecommendedModule.js';

import * as injectedRecommendedModulesApi from '../../../devcomp/application/api/recommended-modules-api.js';

export const findIdsByTargetProfileIds = async (
  { targetProfileIds, recommendedModulesApi = injectedRecommendedModulesApi } = {},
) => {
  const recommendedModules = await recommendedModulesApi.findByTargetProfileIds({ targetProfileIds });
  return recommendedModules.map(toDomain);
};

export const findIdsByCampaignParticipationIds = async (
  { campaignParticipationIds, recommendedModulesApi = injectedRecommendedModulesApi } = {},
) => {
  const userRecommendedModules = await recommendedModulesApi.findByCampaignParticipationIds({
    campaignParticipationIds,
  });
  return userRecommendedModules.map(toDomain);
};

const toDomain = (module) => new RecommendedModule(module);
