const databaseBuffer = require('../database-buffer');

module.exports = function buildUserSavedTutorials({ id = databaseBuffer.getNextId(), tutorialId, userId } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'user-saved-tutorials',
    values: { id, userId, tutorialId },
  });
};
