import * as injectedSkillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';
import * as injectedTutorialRepository from '../../infrastructure/repositories/tutorial-repository.js';
import * as injectedUserSavedTutorialRepository from '../../infrastructure/repositories/user-saved-tutorial-repository.js';

const addTutorialToUser = async function ({
  tutorialRepository = injectedTutorialRepository,
  skillRepository = injectedSkillRepository,
  userSavedTutorialRepository = injectedUserSavedTutorialRepository,
  userId,
  tutorialId,
  skillId,
} = {}) {
  await tutorialRepository.get({ tutorialId });
  if (skillId != null) await skillRepository.get(skillId);

  return userSavedTutorialRepository.addTutorial({ userId, tutorialId, skillId });
};

export { addTutorialToUser };
