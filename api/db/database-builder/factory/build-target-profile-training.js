const databaseBuffer = require('../database-buffer');
const { buildTargetProfile, buildTraining } = require('./index');

module.exports = function buildTargetProfileTraining({
  id = databaseBuffer.getNextId(),
  trainingId = buildTraining().id,
  targetProfileId = buildTargetProfile().id,
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
