const databaseBuffer = require('../database-buffer');

module.exports = function buildUserTutorials(
  {
    id = 10501,
    tutorialId,
    userId,
  } = {}) {

  return databaseBuffer.pushInsertable({
    tableName: 'user_tutorials',
    values: { id, userId, tutorialId },
  });
};
