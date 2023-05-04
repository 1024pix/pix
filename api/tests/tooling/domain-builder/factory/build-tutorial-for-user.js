import { buildTutorial } from './build-tutorial.js';
import { buildUserSavedTutorial } from './build-user-saved-tutorial.js';
import { TutorialForUser } from '../../../../lib/domain/read-models/TutorialForUser.js';

const buildTutorialForUser = function ({
  tutorial = buildTutorial(),
  userSavedTutorial = buildUserSavedTutorial(),
  tutorialEvaluation,
  skillId,
} = {}) {
  return new TutorialForUser({ ...tutorial, tutorialEvaluation, userSavedTutorial, skillId });
};

export { buildTutorialForUser };
