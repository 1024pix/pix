const { UserSavedTutorial } = require('../../../../lib/domain/models/UserSavedTutorial');

module.exports = function buildUserSavedTutorial({
  id = 111,
  userId = '4044',
  tutorialId = '111',
  skillId = '1212',
} = {}) {
  return new UserSavedTutorial({
    id,
    skillId,
    userId,
    tutorialId,
  });
};
