const databaseBuffer = require('../database-buffer');

module.exports = function buildTutorialEvaluation({
  id = databaseBuffer.getNextId(),
  tutorialId,
  userId,
  status = 'LIKED',
  updatedAt = new Date(),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tutorial-evaluations',
    values: {
      id,
      userId,
      tutorialId,
      status,
      updatedAt,
    },
  });
};
