export function findFinalizedSessionsWithRequiredAction({ finalizedSessionRepository, version }) {
  return finalizedSessionRepository.findFinalizedSessionsWithRequiredAction({ version });
}
