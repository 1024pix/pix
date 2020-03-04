module.exports = async function addTutorialToUser(
  {
    tutorialRepository,
    userTutorialRepository,
    userId,
    tutorialId,
  } = {}) {
  await tutorialRepository.get(tutorialId);

  return userTutorialRepository.addTutorial({ userId, tutorialId });
};
