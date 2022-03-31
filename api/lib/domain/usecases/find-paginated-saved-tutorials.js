module.exports = async function findPaginatedSavedTutorials({
  tutorialEvaluationRepository,
  tutorialRepository,
  userId,
  page,
} = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const { models: tutorials, meta } = await tutorialRepository.findPaginatedForCurrentUser({
    userId,
    page,
  });
  const savedTutorials = tutorials.map(_setTutorialEvaluation(tutorialEvaluations));
  return {
    results: savedTutorials,
    meta,
  };
};

function _setTutorialEvaluation(tutorialEvaluations) {
  return (tutorial) => {
    const tutorialEvaluation = tutorialEvaluations.find(
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === tutorial.id
    );
    if (!tutorialEvaluation) return tutorial;
    return {
      ...tutorial,
      tutorialEvaluation,
    };
  };
}
