const databaseBuffer = require('../database-buffer');

module.exports = function buildUserTutorials(
  {
    tutorialId,
    userId,
  } = {}) {

  return databaseBuffer.pushInsertable({
    tableName: 'user_tutorials',
    values: { userId, tutorialId },
  });
};
