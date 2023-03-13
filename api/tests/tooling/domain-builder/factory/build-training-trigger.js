const buildTube = require('./build-tube');
const TrainingTrigger = require('../../../../lib/domain/models/TrainingTrigger');
const TrainingTriggerTube = require('../../../../lib/domain/models/TrainingTriggerTube');

module.exports = function buildTrainingTrigger({
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
