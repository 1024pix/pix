import { TrainingTrigger } from '../../../../lib/domain/models/TrainingTrigger.js';
import { TrainingTriggerTube } from '../../../../lib/domain/models/TrainingTriggerTube.js';
import { buildTube } from './build-tube.js';

const buildTrainingTrigger = function ({
  id = 1000,
  trainingId = 156,
  triggerTubes = [
    new TrainingTriggerTube({
      id: 10002,
      tube: buildTube(),
      level: 2,
    }),
  ],
  type = TrainingTrigger.types.PREREQUISITE,
  threshold = 60,
  areas = [],
  competences = [],
  thematics = [],
} = {}) {
  return new TrainingTrigger({
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

export { buildTrainingTrigger };
