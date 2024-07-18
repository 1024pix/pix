import { lcms } from '../../../src/shared/infrastructure/lcms.js';
import { LearningContentCache } from '../../infrastructure/caches/learning-content-cache.js';

const createLcmsRelease = async function () {
  const learningContent = await lcms.createRelease();
  LearningContentCache.instance.set(learningContent);
};

export { createLcmsRelease };
