const findFinalizedSessionsToPublish = function ({ finalizedSessionRepository }) {
  return finalizedSessionRepository.findFinalizedSessionsToPublish();
};

export { findFinalizedSessionsToPublish };
