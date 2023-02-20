import buildTraining from './build-training';
import databaseBuffer from '../database-buffer';

export default function buildTrainingTrigger({
  id = databaseBuffer.getNextId(),
  trainingId = buildTraining().id,
  threshold = 80,
  type = 'prerequisite',
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  const values = {
    id,
    trainingId,
    threshold,
    type,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'training-triggers',
    values,
  });
}
