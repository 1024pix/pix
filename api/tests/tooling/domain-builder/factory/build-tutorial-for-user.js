import { TutorialForUser } from '../../../../src/devcomp/domain/read-models/TutorialForUser.js';
import { buildTutorial } from './build-tutorial.js';
import { buildUserSavedTutorial } from './build-user-saved-tutorial.js';

const buildTutorialForUser = function ({
  tutorial = buildTutorial(),
  userSavedTutorial = buildUserSavedTutorial(),
  tutorialEvaluation,
  skillId,
} = {}) {
  return new TutorialForUser({ ...tutorial, tutorialEvaluation, userSavedTutorial, skillId });
};

export { buildTutorialForUser };
