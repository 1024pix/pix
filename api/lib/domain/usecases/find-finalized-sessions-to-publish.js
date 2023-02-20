export default function findFinalizedSessionsToPublish({ finalizedSessionRepository }) {
  return finalizedSessionRepository.findFinalizedSessionsToPublish();
}
