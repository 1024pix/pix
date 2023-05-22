const addTutorialToUser = async function ({
  tutorialRepository,
  skillRepository,
  userSavedTutorialRepository,
  userId,
  tutorialId,
  skillId,
} = {}) {
  await tutorialRepository.get(tutorialId);
  if (skillId != null) await skillRepository.get(skillId);

  return userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillId });
};

export { addTutorialToUser };
