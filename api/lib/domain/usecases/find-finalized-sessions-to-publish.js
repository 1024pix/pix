module.exports = function findFinalizedSessionsToPublish({ finalizedSessionRepository }) {
  return finalizedSessionRepository.findFinalizedSessionsToPublish();
};
