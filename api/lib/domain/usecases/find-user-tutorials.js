module.exports = async function findUserTutorials(
  {
    tutorialRepository,
    userTutorialRepository,
    userId,
  } = {}) {
  const userTutorials = await userTutorialRepository.find({ userId });
  const tutorialsIds = userTutorials.map(({ tutorialId }) => tutorialId);
  return tutorialRepository.findByRecordIds(tutorialsIds);
};
