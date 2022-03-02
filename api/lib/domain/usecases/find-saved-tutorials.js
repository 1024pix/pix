module.exports = async function findSavedTutorials({
  tutorialEvaluationRepository,
  userTutorialRepository,
  userId,
} = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const tutorialWithUserTutorial = await userTutorialRepository.findWithTutorial({ userId });
  return tutorialWithUserTutorial.map(_retrieveTutorialEvaluations(tutorialEvaluations));
};

function _retrieveTutorialEvaluations(tutorialEvaluations) {
  return (tutorialWithUserTutorial) => {
    const tutorialEvaluation = tutorialEvaluations.find(
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === tutorialWithUserTutorial.id
    );
    if (tutorialEvaluation) {
      tutorialWithUserTutorial.tutorialEvaluation = tutorialEvaluation;
    }
    return tutorialWithUserTutorial;
  };
}
