const UserSavedTutorialWithTutorial = require('../../../../lib/domain/models/UserSavedTutorialWithTutorial');
const buildSkill = require('./build-skill');
const buildTutorial = require('./build-tutorial');
const buildUser = require('./build-user');

module.exports = function buildUserSavedTutorialWithTutorial({
  id = 123,
  userId = buildUser().id,
  skillId = buildSkill().id,
  tutorial = buildTutorial(),
} = {}) {
  return new UserSavedTutorialWithTutorial({
    id,
    userId,
    skillId,
    tutorial,
  });
};
