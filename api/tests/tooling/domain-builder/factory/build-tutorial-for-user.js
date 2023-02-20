import buildTutorial from './build-tutorial';
import buildUserSavedTutorial from './build-user-saved-tutorial';
import TutorialForUser from '../../../../lib/domain/read-models/TutorialForUser';

export default function buildTutorialForUser({
  tutorial = buildTutorial(),
  userSavedTutorial = buildUserSavedTutorial(),
  tutorialEvaluation,
  skillId,
} = {}) {
  return new TutorialForUser({ ...tutorial, tutorialEvaluation, userSavedTutorial, skillId });
}
