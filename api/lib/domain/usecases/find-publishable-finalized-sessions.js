module.exports = function findPublishableFinalizedSessions({ finalizedSessionRepository }) {
  return finalizedSessionRepository.findPublishableSessions();
};
