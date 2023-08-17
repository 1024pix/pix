import { TrainingTriggerTube } from '../../../../lib/domain/models/TrainingTriggerTube.js';
import { TrainingTriggerForAdmin } from '../../../../lib/domain/read-models/TrainingTriggerForAdmin.js';
import { buildTube } from './build-tube.js';

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
