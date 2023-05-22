import { databaseBuffer } from '../database-buffer.js';

const buildTargetProfileTraining = function ({ id = databaseBuffer.getNextId(), trainingId, targetProfileId } = {}) {
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

export { buildTargetProfileTraining };
