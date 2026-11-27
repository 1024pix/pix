import { DomainError } from '../../../shared/domain/errors.js';
import { usecases } from '../../domain/usecases/index.js';
import { RecommendableModule } from './models/RecommendableModule.js';
import { RecommendedModule } from './models/RecommendedModule.js';

const findByCampaignParticipationIds = async ({ campaignParticipationIds, isForMultipleLearners }) => {
  if (campaignParticipationIds.length === 0) {
    throw new DomainError('campaignParticipationIds can not be empty');
  }

  const recommendedModules = await usecases.findRecommendedModulesByCampaignParticipationIds({
    campaignParticipationIds,
    isForMultipleLearners,
  });

  return recommendedModules.map((recommendedModule) => new RecommendedModule(recommendedModule));
};

const findByTargetProfileIds = async ({ targetProfileIds }) => {
  if (targetProfileIds.length === 0) {
    throw new DomainError('targetProfileIds can not be empty');
  }

  const recommendableModules = await usecases.findRecommendableModulesByTargetProfileIds({
    targetProfileIds,
  });

  return recommendableModules.map((recommendableModule) => new RecommendableModule(recommendableModule));
};

export { findByCampaignParticipationIds, findByTargetProfileIds };
