export function findFinalizedSessionsToPublish({ finalizedSessionRepository, version }) {
  return finalizedSessionRepository.findFinalizedSessionsToPublish({ version });
}
