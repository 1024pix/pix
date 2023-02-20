import lcms from '../../infrastructure/lcms';
import cache from '../../infrastructure/caches/learning-content-cache';

export default async function createLcmsRelease() {
  const learningContent = await lcms.createRelease();
  cache.set(learningContent);
}
