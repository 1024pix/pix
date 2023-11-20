import { buildTube } from './build-tube.js';
import { TrainingTriggerTube } from '../../../../src/devcomp/domain/models/TrainingTriggerTube.js';

const buildTrainingTriggerTube = function ({ id = 1000, tube = buildTube(), level = 8 } = {}) {
  return new TrainingTriggerTube({
    id,
    tube,
    level,
  });
};

export { buildTrainingTriggerTube };
