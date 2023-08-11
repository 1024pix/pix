const addTutorialEvaluation = async function ({
  tutorialRepository,
  tutorialEvaluationRepository,
  userId,
  tutorialId,
  status,
} = {}) {
  await tutorialRepository.get({ tutorialId });

  return tutorialEvaluationRepository.createOrUpdate({ userId, tutorialId, status });
};

export { addTutorialEvaluation };
