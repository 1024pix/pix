const databaseBuffer = require('../database-buffer');

module.exports = function buildTargetProfileTraining({
  id = databaseBuffer.getNextId(),
  trainingId,
  targetProfileId,
} = {}) {
  const values = {
    id,
    trainingId,
    targetProfileId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile-trainings',
    values,
  });
};
