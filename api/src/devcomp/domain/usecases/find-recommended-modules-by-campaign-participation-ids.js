import * as injectedModuleRepository from '../../infrastructure/repositories/module-repository.js';
import * as injectedUserRecommendedTrainingRepository from '../../infrastructure/repositories/user-recommended-training-repository.js';
import { UserRecommendedModule } from '../read-models/UserRecommendedModule.js';

export const findRecommendedModulesByCampaignParticipationIds = async function ({
  campaignParticipationIds,
  moduleRepository = injectedModuleRepository,
  userRecommendedTrainingRepository = injectedUserRecommendedTrainingRepository,
} = {}) {
  const userRecommendedTrainings = await userRecommendedTrainingRepository.findModulesByCampaignParticipationIds({
    campaignParticipationIds,
  });
  const userRecommendedModules = await Promise.all(
    userRecommendedTrainings.map(async ({ id, link }) => {
      const regexp = /^\/modules\/([a-z0-9-]*)/;

      const result = regexp.exec(link);
      const slug = result[1];
      const module = await moduleRepository.getBySlug({ slug });
      return { id, moduleId: module.id };
    }),
  );

  return userRecommendedModules.map((module) => new UserRecommendedModule(module));
};
