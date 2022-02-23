const _ = require('lodash');

module.exports = async function findUserTutorials({
  tutorialEvaluationRepository,
  userTutorialRepository,
  userId,
} = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const userTutorialsWithTutorial = await userTutorialRepository.findWithTutorial({ userId });
  _retrieveTutorialEvaluations(userTutorialsWithTutorial, tutorialEvaluations);
  return userTutorialsWithTutorial;
};

function _retrieveTutorialEvaluations(savedTutorials, tutorialEvaluations) {
  _.forEach(savedTutorials, (userTutorial) => {
    const tutorialEvaluation = _.find(
      tutorialEvaluations,
      (tutorialEvaluation) => tutorialEvaluation.tutorialId === userTutorial.tutorial.id
    );
    if (tutorialEvaluation) {
      userTutorial.tutorial.tutorialEvaluation = tutorialEvaluation;
    }
  });
}
