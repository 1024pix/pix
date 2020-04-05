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
  return _.map(savedTutorials, _buildUserTutorial(userId));
};

function _buildUserTutorial(userId) {
  return (tutorial) => ({ userId, tutorial: { ...tutorial, isSaved: true } });
}
