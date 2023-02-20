import buildTrainingTrigger from './build-training-trigger';
import databaseBuffer from '../database-buffer';

export default function buildTrainingTriggerTube({
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
}
