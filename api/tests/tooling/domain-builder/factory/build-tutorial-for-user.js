const buildTutorial = require('./build-tutorial');
const buildUserSavedTutorial = require('./build-user-saved-tutorial');
const TutorialForUser = require('../../../../lib/domain/read-models/TutorialForUser');

module.exports = function buildTutorialForUser({
  tutorial = buildTutorial(),
  userTutorial = buildUserSavedTutorial(),
  tutorialEvaluation,
} = {}) {
  return new TutorialForUser({ ...tutorial, tutorialEvaluation, userTutorial });
};
