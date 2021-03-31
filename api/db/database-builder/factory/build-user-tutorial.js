const databaseBuffer = require('../database-buffer');

module.exports = function buildUserTutorials({
  id = databaseBuffer.getNextId(),
  tutorialId,
  userId,
} = {}) {

  return databaseBuffer.pushInsertable({
    tableName: 'user_tutorials',
    values: { id, userId, tutorialId },
  });
};
