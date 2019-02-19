const _ = require('lodash');

module.exports = async function getAnswerWithRecentKnowledgeElements({ answerId, answerRepository, assessmentRepository, smartPlacementKnowledgeElementRepository }) {
  const answer = await answerRepository.get(answerId);
  if(answer.knowledgeElements.length > 0) {
    const assessment = await assessmentRepository.get(answer.assessmentId);
    if(assessment.isSmartPlacement()) {
      const knowledgeElementsValidatedByUserOrderedBySavedDate = await smartPlacementKnowledgeElementRepository.findFirstSavedKnowledgeElementsByUserId({
        userId: assessment.userId,
        skillIds: _.map(answer.knowledgeElements, 'skillId')
      });
      const knowledgeElementsToKeep = _.intersectionBy(knowledgeElementsValidatedByUserOrderedBySavedDate, answer.knowledgeElements, 'id');
      answer.knowledgeElementsRecentlyKnown = knowledgeElementsToKeep;
    }
  }
  return answer;
};
