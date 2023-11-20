import { buildTube } from './build-tube.js';
import { TrainingTriggerForAdmin } from '../../../../src/devcomp/domain/read-models/TrainingTriggerForAdmin.js';
import { TrainingTriggerTube } from '../../../../lib/domain/models/TrainingTriggerTube.js';

const buildTrainingTriggerForAdmin = function ({
  id = 1000,
  trainingId = 156,
  triggerTubes = [
    new TrainingTriggerTube({
      id: 10002,
      tube: buildTube(),
      level: 2,
    }),
  ],
  type = TrainingTriggerForAdmin.types.PREREQUISITE,
  threshold = 60,
  areas = [],
  competences = [],
  thematics = [],
} = {}) {
  return new TrainingTriggerForAdmin({
    id,
    trainingId,
    triggerTubes,
    type,
    threshold,
    areas,
    competences,
    thematics,
  });
};

export { buildTrainingTriggerForAdmin };
