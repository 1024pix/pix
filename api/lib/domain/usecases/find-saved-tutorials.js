module.exports = async function findSavedTutorials({ tutorialEvaluationRepository, tutorialRepository, userId } = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const tutorialWithUserSavedTutorial = await tutorialRepository.findWithUserTutorialForCurrentUser({ userId });
  return tutorialWithUserSavedTutorial.map(_setTutorialEvaluation(tutorialEvaluations));
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
