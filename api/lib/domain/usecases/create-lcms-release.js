const lcms = require('../../infrastructure/lcms.js');
const cache = require('../../infrastructure/caches/learning-content-cache.js');

module.exports = async function createLcmsRelease() {
  const learningContent = await lcms.createRelease();
  cache.set(learningContent);
};
