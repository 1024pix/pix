import { TrainingTriggerTube } from '../../../../lib/domain/models/TrainingTriggerTube.js';
import { buildTube } from './build-tube.js';

const buildTrainingTriggerTube = function ({ id = 1000, tube = buildTube(), level = 8 } = {}) {
  return new TrainingTriggerTube({
    id,
    tube,
    level,
  });
};

export { buildTrainingTriggerTube };
