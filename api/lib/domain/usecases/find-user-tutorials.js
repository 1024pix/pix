const _ = require('lodash');

module.exports = async function findUserTutorials(
  {
    tutorialEvaluationRepository,
    tutorialRepository,
    userTutorialRepository,
    userId,
  } = {}) {
  const tutorialEvaluations = await tutorialEvaluationRepository.find({ userId });
  const userTutorials = await userTutorialRepository.find({ userId });
  const tutorialsIds = userTutorials.map(({ tutorialId }) => tutorialId);
  const savedTutorials = await tutorialRepository.findByRecordIds(tutorialsIds);

  _retrieveTutorialEvaluations(savedTutorials, tutorialEvaluations);

  return _.map(userTutorials, _buildUserTutorial(userId, savedTutorials));
};

function _retrieveTutorialEvaluations(savedTutorials, tutorialEvaluations) {
  _.forEach(savedTutorials, (tutorial) => {
    const tutorialEvaluation = _.find(tutorialEvaluations, (tutorialEvaluation) => tutorialEvaluation.tutorialId === tutorial.id);
    if (tutorialEvaluation) {
      tutorial.tutorialEvaluation = tutorialEvaluation;
    }
  });
}

function _buildUserTutorial(userId, tutorials) {
  function getTutorial(userTutorial) {
    return _.find(tutorials, ({ id }) => id === userTutorial.tutorialId);
  }

  return (userTutorial) => ({ ...userTutorial, tutorial: getTutorial(userTutorial) });
}
