export default async function addTutorialEvaluation({
  tutorialRepository,
  tutorialEvaluationRepository,
  userId,
  tutorialId,
  status,
} = {}) {
  await tutorialRepository.get(tutorialId);

  return tutorialEvaluationRepository.createOrUpdate({ userId, tutorialId, status });
}
