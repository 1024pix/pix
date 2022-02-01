module.exports = async function addTutorialEvaluation({
  tutorialRepository,
  tutorialEvaluationRepository,
  userId,
  tutorialId,
} = {}) {
  await tutorialRepository.get(tutorialId);

  return tutorialEvaluationRepository.addEvaluation({ userId, tutorialId });
};
