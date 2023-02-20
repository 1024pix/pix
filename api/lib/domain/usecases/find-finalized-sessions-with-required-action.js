export default function findFinalizedSessionsWithRequiredAction({ finalizedSessionRepository }) {
  return finalizedSessionRepository.findFinalizedSessionsWithRequiredAction();
}
