const CampaignLearningContent = require('../../../../lib/domain/models/CampaignLearningContent');
const buildLearningContent = require('./build-learning-content');

function buildCampaignLearningContent(learningContent = buildLearningContent()) {
  return new CampaignLearningContent(learningContent);
}

buildCampaignLearningContent.fromFrameworks = (frameworks) => {
  const learningContent = buildLearningContent(frameworks);
  return buildCampaignLearningContent(learningContent);
};

buildCampaignLearningContent.withSimpleContent = () => {
  const simpleLearningContent = buildLearningContent.withSimpleContent();
  return buildCampaignLearningContent(simpleLearningContent);
};

module.exports = buildCampaignLearningContent;
