module.exports = async function findSavedTutorials({ tutorialEvaluationRepository, tutorialRepository, userId } = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const tutorialWithUserSavedTutorial = await tutorialRepository.findWithUserTutorialForCurrentUser({ userId });
  return tutorialWithUserSavedTutorial.map(_retrieveTutorialEvaluations(tutorialEvaluations));
};

function _retrieveTutorialEvaluations(tutorialEvaluations) {
  return (tutorialWithUserSavedTutorial) => {
    const tutorialEvaluation = tutorialEvaluations.find(
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === tutorialWithUserSavedTutorial.id
    );
    if (tutorialEvaluation) {
      tutorialWithUserSavedTutorial.tutorialEvaluation = tutorialEvaluation;
    }
    return tutorialWithUserSavedTutorial;
  };
}
