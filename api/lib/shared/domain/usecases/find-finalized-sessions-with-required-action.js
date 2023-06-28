const findFinalizedSessionsWithRequiredAction = function ({ finalizedSessionRepository }) {
  return finalizedSessionRepository.findFinalizedSessionsWithRequiredAction();
};

export { findFinalizedSessionsWithRequiredAction };
