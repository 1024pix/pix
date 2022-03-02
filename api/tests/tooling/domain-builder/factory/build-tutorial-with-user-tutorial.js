const buildTutorial = require('./build-tutorial');
const buildUserSavedTutorial = require('./build-user-saved-tutorial');
const TutorialWithUserSavedTutorial = require('../../../../lib/domain/models/TutorialWithUserSavedTutorial');

module.exports = function buildTutorialWithUserSavedTutorial({
  tutorial = buildTutorial(),
  userSavedTutorial = buildUserSavedTutorial(),
} = {}) {
  return new TutorialWithUserSavedTutorial(tutorial, userSavedTutorial);
};
