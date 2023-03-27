const buildTube = require('./build-tube');
const TrainingTriggerForAdmin = require('../../../../lib/domain/read-models/TrainingTriggerForAdmin');
const TrainingTriggerTube = require('../../../../lib/domain/models/TrainingTriggerTube');

module.exports = function buildTrainingTriggerForAdmin({
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
