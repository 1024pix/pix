const lcms = require('../../infrastructure/lcms');
const cache = require('../../infrastructure/caches/learning-content-cache');

module.exports = async function createLcmsRelease() {
  const learningContent = await lcms.createRelease();
  cache.set('LearningContent', learningContent);
};
