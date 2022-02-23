const UserTutorialWithTutorial = require('../../../../lib/domain/models/UserTutorialWithTutorial');
const buildTutorial = require('./build-tutorial');
const buildUser = require('./build-user');

module.exports = function buildUserTutorialWithTutorial({
  id = 123,
  userId = buildUser().id,
  tutorial = buildTutorial(),
} = {}) {
  return new UserTutorialWithTutorial({
    id,
    userId,
    tutorial,
  });
};
