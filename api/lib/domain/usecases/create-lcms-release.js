const lcms = require('../../infrastructure/lcms.js');
const { learningContentCache } = require('../../infrastructure/caches/learning-content-cache.js');

module.exports = async function createLcmsRelease() {
  const learningContent = await lcms.createRelease();
  learningContentCache.set(learningContent);
};
