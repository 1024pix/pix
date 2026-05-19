import * as recommendedModulesApi from '../../../devcomp/application/api/recommended-modules-api.js';
import { RecommendedModule } from '../../domain/models/RecommendedModule.js';

export const findIdsByTargetProfileIds = async ({ targetProfileIds, dependencies = { recommendedModulesApi } }) => {
  const recommendedModules = await dependencies.recommendedModulesApi.findByTargetProfileIds({ targetProfileIds });
  return recommendedModules.map(toDomain);
};

export const findIdsByCampaignParticipationIds = async ({
  campaignParticipationIds,
  dependencies = { recommendedModulesApi },
}) => {
  const userRecommendedModules = await dependencies.recommendedModulesApi.findByCampaignParticipationIds({
    campaignParticipationIds,
  });
  return userRecommendedModules.map(toDomain);
};

const toDomain = (module) => new RecommendedModule(module);
