import { databaseBuffer } from '../database-buffer.ts';

const buildTargetProfileTraining = function ({
  id = databaseBuffer.getNextId(),
  trainingId,
  targetProfileId,
  createdAt,
  updatedAt,
} = {}) {
  const values = {
    id,
    trainingId,
    targetProfileId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile-trainings',
    values,
  });
};

export { buildTargetProfileTraining };
