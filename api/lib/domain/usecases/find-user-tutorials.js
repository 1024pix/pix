module.exports = async function findUserTutorials({
  tutorialEvaluationRepository,
  userTutorialRepository,
  userId,
} = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const userTutorialsWithTutorial = await userTutorialRepository.findWithTutorial({ userId });
  return userTutorialsWithTutorial.map(_retrieveTutorialEvaluations(tutorialEvaluations));
};

function _retrieveTutorialEvaluations(tutorialEvaluations) {
  return (userSavedTutorial) => {
    const tutorialEvaluation = tutorialEvaluations.find(
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === userSavedTutorial.tutorial.id
    );
    if (tutorialEvaluation) {
      userSavedTutorial.tutorial.tutorialEvaluation = tutorialEvaluation;
    }
    return userSavedTutorial;
  };
}
