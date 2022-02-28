const UserSavedTutorialWithTutorial = require('../../../../lib/domain/models/UserSavedTutorialWithTutorial');
const buildTutorial = require('./build-tutorial');
const buildUser = require('./build-user');

module.exports = function buildUserSavedTutorialWithTutorial({
  id = 123,
  userId = buildUser().id,
  tutorial = buildTutorial(),
} = {}) {
  return new UserSavedTutorialWithTutorial({
    id,
    userId,
    tutorial,
  });
};
