import { LearningContentCache } from '../../infrastructure/caches/learning-content-cache.js';
import { lcms } from '../../infrastructure/lcms.js';

const createLcmsRelease = async function () {
  const learningContent = await lcms.createRelease();
  LearningContentCache.instance.set(learningContent);
};

export { createLcmsRelease };
