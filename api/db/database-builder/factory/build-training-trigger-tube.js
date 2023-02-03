const buildTrainingTrigger = require('./build-training-trigger');
const databaseBuffer = require('../database-buffer');

module.exports = function buildTrainingTriggerTube({
  id = databaseBuffer.getNextId(),
  trainingTriggerId = buildTrainingTrigger().id,
  tubeId = 'tubeId1',
  level = 8,
} = {}) {
  const values = {
    id,
    trainingTriggerId,
    tubeId,
    level,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'training-trigger-tubes',
    values,
  });
};
