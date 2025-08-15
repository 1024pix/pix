import * as injectedModuleRepository from '../../infrastructure/repositories/module-repository.js';
import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';
import { RecommendedModule } from '../read-models/RecommendedModule.js';

const findRecommendedModulesByTargetProfileIds = async function ({
  targetProfileIds,
  trainingRepository = injectedTrainingRepository,
  moduleRepository = injectedModuleRepository,
} = {}) {
  const recommendedTrainings = await trainingRepository.findModulesByTargetProfileIds({ targetProfileIds });

  const recommendedModules = await Promise.all(
    recommendedTrainings.map(async ({ id, link, targetProfileIds }) => {
      const regexp = /^\/modules\/([a-z0-9-]*)/;

      const result = regexp.exec(link);
      const slug = result[1];
      const module = await moduleRepository.getBySlug({ slug });
      return { id, moduleId: module.id, targetProfileIds };
    }),
  );

  return recommendedModules.map((module) => new RecommendedModule(module));
};

export { findRecommendedModulesByTargetProfileIds };
