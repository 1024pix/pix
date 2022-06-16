const databaseBuffer = require('../database-buffer');

module.exports = function buildTutorialEvaluation({
  id = databaseBuffer.getNextId(),
  tutorialId,
  userId,
  status = 'LIKED',
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tutorial-evaluations',
    values: {
      id,
      userId,
      tutorialId,
      status,
    },
  });
};
