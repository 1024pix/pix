const LearningContent = require('../../../../lib/domain/models/LearningContent');
const buildArea = require('./build-area');

module.exports = function buildLearningContent(areas = [buildArea()]) {
  return new LearningContent(areas);
};
