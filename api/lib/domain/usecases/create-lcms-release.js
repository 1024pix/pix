import { lcms } from '../../infrastructure/lcms.js';
import { learningContentCache } from '../../infrastructure/caches/learning-content-cache.js';

const createLcmsRelease = async function () {
  const learningContent = await lcms.createRelease();
  learningContentCache.set(learningContent);
};

export { createLcmsRelease };
