const _ = require('lodash');

module.exports = async function findUserTutorials(
  {
    tutorialRepository,
    userTutorialRepository,
    userId,
  } = {}) {
  const userTutorials = await userTutorialRepository.find({ userId });
  const tutorialsIds = userTutorials.map(({ tutorialId }) => tutorialId);
  const savedTutorials = await tutorialRepository.findByRecordIds(tutorialsIds);
  return _.map(userTutorials, _buildUserTutorial(userId, savedTutorials));
};

function _buildUserTutorial(userId, tutorials) {
  function getTutorial(userTutorial) {
    return _.find(tutorials, ({ id }) => id === userTutorial.tutorialId);
  }

  return (userTutorial) => ({ ...userTutorial, tutorial: getTutorial(userTutorial) });
}
