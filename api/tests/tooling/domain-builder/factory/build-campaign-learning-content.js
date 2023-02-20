import CampaignLearningContent from '../../../../lib/domain/models/CampaignLearningContent';
import buildLearningContent from './build-learning-content';

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

export default buildCampaignLearningContent;
