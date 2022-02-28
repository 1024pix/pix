const databaseBuffer = require('../database-buffer');

module.exports = function buildUserSavedTutorial({
  id = databaseBuffer.getNextId(),
  tutorialId,
  userId,
  skillId = null,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'user-saved-tutorials',
    values: { id, userId, tutorialId, skillId },
  });
};
