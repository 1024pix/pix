module.exports = async function findUserTutorials({
  tutorialEvaluationRepository,
  userTutorialRepository,
  userId,
} = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const userSavedTutorialsWithTutorial = await userTutorialRepository.findWithTutorial({ userId });
  return userSavedTutorialsWithTutorial.map(_setTutorialEvaluation(tutorialEvaluations));
};

function _setTutorialEvaluation(tutorialEvaluations) {
  return (userSavedTutorial) => {
    const tutorialEvaluation = tutorialEvaluations.find(
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === userSavedTutorial.tutorial.id
    );
    if (!tutorialEvaluation) return userSavedTutorial;
    return {
      ...userSavedTutorial,
      tutorial: {
        ...userSavedTutorial.tutorial,
        tutorialEvaluation,
      },
    };
  };
}
