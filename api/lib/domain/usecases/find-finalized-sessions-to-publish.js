const findFinalizedSessionsToPublish = function ({ finalizedSessionRepository, version }) {
  return finalizedSessionRepository.findFinalizedSessionsToPublish({ version });
};

export { findFinalizedSessionsToPublish };
