import databaseBuffer from '../database-buffer';

export default function buildTargetProfileTraining({
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
}
