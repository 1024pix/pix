const findFinalizedSessionsWithRequiredAction = function ({ finalizedSessionRepository, version }) {
  return finalizedSessionRepository.findFinalizedSessionsWithRequiredAction({ version });
};

export { findFinalizedSessionsWithRequiredAction };
