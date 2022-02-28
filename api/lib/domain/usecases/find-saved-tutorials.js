module.exports = async function findSavedTutorials({
  tutorialEvaluationRepository,
  userTutorialRepository,
  userId,
} = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const userTutorialsWithTutorial = await userTutorialRepository.findWithTutorial({ userId });
  return userTutorialsWithTutorial.map(_retrieveTutorialEvaluations(tutorialEvaluations));
};

function _retrieveTutorialEvaluations(tutorialEvaluations) {
  return (userTutorial) => {
    const tutorialEvaluation = tutorialEvaluations.find(
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === userTutorial.tutorial.id
    );
    if (tutorialEvaluation) {
      userTutorial.tutorial.tutorialEvaluation = tutorialEvaluation;
    }
    return userTutorial;
  };
}
