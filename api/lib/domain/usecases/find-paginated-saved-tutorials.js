module.exports = async function findPaginatedSavedTutorials({
  tutorialEvaluationRepository,
  tutorialRepository,
  userId,
  page,
} = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const { models: tutorialWithUserSavedTutorial, meta } =
    await tutorialRepository.findPaginatedWithUserTutorialForCurrentUser({
      userId,
      page,
    });
  const savedTutorials = tutorialWithUserSavedTutorial.map(_setTutorialEvaluation(tutorialEvaluations));
  return {
    results: savedTutorials,
    meta,
  };
};

function _setTutorialEvaluation(tutorialEvaluations) {
  return (tutorialWithUserSavedTutorial) => {
    const tutorialEvaluation = tutorialEvaluations.find(
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === tutorialWithUserSavedTutorial.id
    );
    if (!tutorialEvaluation) return tutorialWithUserSavedTutorial;
    return {
      ...tutorialWithUserSavedTutorial,
      tutorialEvaluation,
    };
  };
}
