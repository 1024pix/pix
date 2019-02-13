module.exports = function getAnswerWithRecentKnowledgeElements({ answerId, answerRepository }) {
  return answerRepository.get(answerId);
};
