import { databaseBuffer } from '../database-buffer.ts';
import { buildTrainingTrigger } from './build-training-trigger.js';

const buildTrainingTriggerTube = function ({
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

export { buildTrainingTriggerTube };
