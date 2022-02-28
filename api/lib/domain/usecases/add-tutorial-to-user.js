module.exports = async function addTutorialToUser({
  tutorialRepository,
  skillRepository,
  userTutorialRepository,
  userId,
  tutorialId,
  skillId,
} = {}) {
  await tutorialRepository.get(tutorialId);
  if (skillId != null) await skillRepository.get(skillId);

  return userTutorialRepository.addTutorial({ userId, tutorialId, skillId });
};
